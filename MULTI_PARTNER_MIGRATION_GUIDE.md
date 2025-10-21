# Multi-Partner System Migration Guide

## Status: ⚠️ IN PROGRESS - Backend Complete, Frontend Pending

## What's Been Completed

### Backend (✅ Complete)
1. **New Database Models:**
   - `Partnership` - Many-to-many user partnerships
   - `Invitation` - Tracks email invitations with status

2. **Updated Endpoints:**
   - `GET /users/me` - Returns `partners` array and `pendingInvitations`
   - `POST /match/invite` - Creates `Invitation` records
   - `POST /match/unmatch` - Now requires `partnerId` parameter
   - `POST /auth/register` - Uses Invitation model for partnerships
   - `GET /match/suggestions` - Excludes existing partners

3. **Helper Utilities:**
   - `backend/src/utils/partnerships.js` - Partnership query helpers

### Frontend (⏳ Pending)
The frontend still needs major updates to work with the new system.

## Required Frontend Changes

### 1. Update PartnerPage.js

**Current:** Shows single partner
**Needed:** Show multiple partners + pending invitations

```javascript
// Add to state
const [partners, setPartners] = useState([]);
const [pendingInvitations, setPendingInvitations] = useState([]);

// Use user.partners instead of user.partner
useEffect(() => {
  if (user?.partners) {
    setPartners(user.partners);
  }
  if (user?.pendingInvitations) {
    setPendingInvitations(user.pendingInvitations);
  }
}, [user]);

// Update unmatch to pass partnerId
const handleUnmatch = async (partnerId, partnerName) => {
  if (!window.confirm(`Unmatch from ${partnerName}?`)) return;

  try {
    await matchApi.unmatch(partnerId);
    toast.success('Successfully unmatched');
    await refreshUser();
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to unmatch');
  }
};
```

### 2. Update api.js unmatch

```javascript
// In frontend/src/services/api.js
export const match = {
  // ... other methods
  unmatch: (partnerId) => api.post('/match/unmatch', { partnerId }),
};
```

### 3. Show Pending Invitations UI

Add section to PartnerPage to show pending email invitations:

```javascript
{pendingInvitations.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      Pending Invitations ({pendingInvitations.length})
    </h3>
    <div className="space-y-3">
      {pendingInvitations.map(invite => (
        <div key={invite.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{invite.email}</p>
              <p className="text-sm text-gray-500">
                Sent {new Date(invite.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              Pending
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 4. Update Goal/Comment Queries

The app currently assumes single partner. Need to update:
- `goalsApi.getPartnerCurrentWeek()` - May need to accept partnerId
- Partner goal displays - Show goals from all partners or selected partner

## Database Migration

Run on Render:
```bash
npx prisma db push --accept-data-loss
```

This will create the new `Partnership` and `Invitation` tables.

## Testing Checklist

- [ ] Can send email invitations
- [ ] Pending invitations show in UI
- [ ] New user registers with invite token
- [ ] Partnership automatically created
- [ ] Invitation marked as "accepted"
- [ ] Multiple partners display correctly
- [ ] Can unmatch from specific partner
- [ ] Partnership requests still work
- [ ] Goals/comments work with multiple partners

## Breaking Changes

1. `/match/unmatch` now requires `partnerId` in body
2. Frontend must use `user.partners` array instead of `user.partner`
3. Old single-partner assumptions throughout UI need updates

## Rollback Plan

If needed, revert commits:
- `git revert e3a5385` (backend multi-partner updates)
- `git revert 6bedac3` (schema + core backend)

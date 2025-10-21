# Partnership Request System Implementation

## ✅ Completed Features

### 1. Database Schema Updates
- **Added `PartnershipRequest` model** with fields:
  - `id`: Unique identifier
  - `status`: "pending", "accepted", or "rejected"
  - `senderId`: User who sent the request
  - `receiverId`: User who received the request
  - `createdAt`, `updatedAt`: Timestamps
  - **Unique constraint**: Prevents duplicate requests between same users
  - **Index**: Fast lookups for receiver's pending requests

### 2. Backend API Endpoints

#### GET `/api/match/requests`
- Returns all pending partnership requests for the current user
- Includes both sent and received requests
- Includes full sender and receiver details

#### POST `/api/match/request`
- **CHANGED**: Now creates a partnership request instead of auto-matching
- Validates both users are available
- Prevents duplicate requests
- Returns request details

#### POST `/api/match/requests/:requestId/accept`
- **NEW**: Accept a partnership request
- Only the receiver can accept
- Creates mutual partnership (both users get partnerId set)
- Updates request status to "accepted"
- Returns partner details

#### POST `/api/match/requests/:requestId/reject`
- **NEW**: Reject a partnership request
- Only the receiver can reject
- Updates request status to "rejected"
- Request remains in database for history

### 3. Frontend Updates

#### PartnerPage UI
**When user has NO partner:**

1. **Partnership Requests Section** (New!)
   - Shows all pending requests
   - **Received requests**: Display with Accept/Reject buttons
   - **Sent requests**: Display as "Request pending..."
   - Each request shows:
     - User's name and bio
     - Clear indicator if you're the sender or receiver
     - Action buttons (only for received requests)

2. **Suggested Matches** (Updated)
   - "Partner Up" button now **sends a request** instead of auto-matching
   - Shows success message: "Partnership request sent! 📨"

3. **Invite a Friend**
   - Unchanged - still sends email invitations

**When user HAS a partner:**
- Shows partner card with goals
- Can add comments to partner's goals
- Unmatch button available

## How It Works Now

### Scenario 1: Using Suggested Matches

1. **User A** sees User B in suggested matches
2. **User A** clicks "Partner Up" on User B's card
3. **System** creates a partnership request (status: pending)
4. **User A** sees "⏳ Request pending..." in requests section
5. **User B** sees "✉️ Wants to partner with you!" with Accept/Reject buttons
6. **User B** clicks "Accept"
7. **System** creates mutual partnership
8. **Both users** can now see each other's goals and add comments

### Scenario 2: Email Invitation

1. **User A** enters User C's email
2. **User C** receives email with registration link
3. **User C** registers using the link
4. **System** automatically creates mutual partnership
5. **Both users** immediately become partners (no request needed)

### Scenario 3: Rejecting a Request

1. **User D** sends request to User E
2. **User E** clicks "Reject"
3. **System** marks request as rejected
4. **User D** no longer sees the request in their list
5. **User E** can still see User D in suggested matches

## Mutual Goal Visibility & Chat

### Goal Visibility
Once partnered, **both users can**:
- See each other's current week goals
- View completion status
- See notes on goals

### Chat/Comments System
- Each user can **add comments** to their partner's goals
- Comments are visible to both users
- Comments show author name
- Sorted chronologically

**Example:**
- User A sets goal: "Run 5 miles"
- User B (partner) can click "+ add note" on User A's goal
- User B writes: "You got this! 💪"
- Comment appears on User A's goal with "User B" as author

## API Reference

### Match API (frontend/src/services/api.js)

```javascript
export const match = {
  getSuggestions: () => api.get('/match/suggestions'),
  request: (partnerId) => api.post('/match/request', { partnerId }),
  getRequests: () => api.get('/match/requests'),
  acceptRequest: (requestId) => api.post(`/match/requests/${requestId}/accept`),
  rejectRequest: (requestId) => api.post(`/match/requests/${requestId}/reject`),
  unmatch: () => api.post('/match/unmatch'),
  invite: (email) => api.post('/match/invite', { email })
};
```

## Testing the New System

### Test Scenario 1: Request Flow

1. **Create two test accounts** (or use existing ones)
2. **Unmatch** if already partnered
3. **User 1**: Go to Partner page
4. **User 1**: Click "Partner Up" on User 2's card
5. **User 1**: Should see "Request pending..." in requests section
6. **User 2**: Go to Partner page
7. **User 2**: Should see request with "Wants to partner with you!"
8. **User 2**: Click "Accept"
9. **Both users**: Should now see each other's goals

### Test Scenario 2: Rejection Flow

1. **User 1**: Send request to User 2
2. **User 2**: Click "Reject"
3. **User 2**: Request disappears from list
4. **User 1**: Request disappears from sent requests
5. **User 2**: Can still see User 1 in suggestions

### Test Scenario 3: Comments

1. **Ensure users are partnered**
2. **User 1**: Create a goal
3. **User 2**: Go to Partner page
4. **User 2**: Should see User 1's goal
5. **User 2**: Click "+ add note"
6. **User 2**: Enter comment and save
7. **User 1**: Refresh - should see comment from User 2

## Database Migration

The schema was updated with:
```bash
npx prisma db push
```

No manual SQL needed - Prisma handles it automatically.

## Breaking Changes

⚠️ **Important**: The `/match/request` endpoint behavior changed:

**Before:**
- Immediately created mutual partnership
- Both users auto-matched

**After:**
- Creates a pending request
- Receiver must accept before partnership is created

**Migration for existing code:**
- If you have automated tests expecting instant matching, update them
- Email invitations still work the same (auto-match on registration)

## Future Enhancements (Not Implemented)

Possible improvements:
- [ ] Notification system for new requests
- [ ] Request expiration (auto-reject after X days)
- [ ] Block user feature
- [ ] Request message/introduction
- [ ] Partnership history page
- [ ] Analytics (most common reject reasons, etc.)

## Troubleshooting

**"Partnership request already pending" error:**
- A request already exists between these users
- Check the Partnership Requests section

**Request not appearing:**
- Refresh the page
- Check backend console for errors
- Verify backend server is running

**Can't see partner's goals:**
- Ensure request was accepted (check database)
- Refresh user data
- Check that goals exist for current week

**Comments not showing:**
- Verify partnership exists (both users have partnerId set)
- Check goal belongs to partner
- Ensure comment was created successfully

## Files Modified

### Backend:
- `prisma/schema.prisma` - Added PartnershipRequest model
- `src/routes/match.js` - Added request/accept/reject endpoints

### Frontend:
- `src/services/api.js` - Added new API methods
- `src/pages/PartnerPage.js` - Added request UI and handlers

### Scripts:
None - existing diagnostic scripts still work

## Summary

The partnership system now requires **mutual consent** before users can see each other's goals and communicate. This prevents unwanted partnerships and gives users control over who they partner with.

✅ Both users must agree to partner
✅ Clear UI for pending requests
✅ Full goal visibility once partnered
✅ Comment/chat system works for both partners
✅ Email invitations still auto-match (convenience for friends)

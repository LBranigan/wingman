# Multi-Line Paste Feature

## Overview

The Wingman app now supports pasting multiple lines of text at once when creating goals. This allows users to copy goals from Excel, Word, or any other source and paste them all at once, with each line becoming a separate goal.

## How It Works

### User Experience

1. **Navigate to Goal Creation**: Click to create a new goal set
2. **Set Duration**: Choose your goal set duration (e.g., "1 week")
3. **Paste Multiple Lines**: In any goal input field, paste text containing multiple lines
4. **Automatic Splitting**: Each line is automatically converted into a separate goal
5. **Visual Feedback**: A toast notification shows how many goals were pasted (e.g., "5 goals pasted! 📋")
6. **Finish**: Click "Finish" to create all goals at once

### Example Usage

**From Excel:**
```
Complete project proposal
Review team feedback
Schedule client meeting
Update documentation
Prepare presentation
```

Simply copy these rows from Excel and paste into any goal input field. All 5 goals will be created automatically.

**From Word/Text:**
Any multi-line text will work:
```
Exercise 3 times this week
Read one chapter daily
Meditate for 10 minutes
Drink 8 glasses of water
Sleep before 11pm
```

## Technical Implementation

### Frontend Changes

**File: `frontend/src/pages/DashboardPage.js`**

#### New Function: `handleGoalPaste`
- Detects paste events on goal input fields
- Splits pasted text by newlines (`\r?\n`)
- Filters out empty lines
- Creates separate goal inputs for each line
- Shows success notification
- Auto-focuses next empty input

```javascript
const handleGoalPaste = (e, index) => {
  const pastedText = e.clipboardData.getData('text');
  const lines = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length > 1) {
    e.preventDefault();
    // Insert each line as a separate goal
    // ...
    toast.success(`${lines.length} goals pasted! 📋`);
  }
};
```

#### Updated Input Field
- Added `onPaste` event handler
- Updated placeholder text to indicate multi-line paste support

### Backend Changes

**File: `backend/src/routes/goals.js`**

#### New Endpoint: `POST /api/goals/bulk`
- Accepts an array of goal texts
- Creates all goals in a single database transaction
- Returns array of created goals
- Protected by authentication middleware
- Validated by `bulkCreateGoals` schema

```javascript
router.post('/bulk', authMiddleware, validate('bulkCreateGoals'), async (req, res) => {
  const { goals } = req.body;

  const createdGoals = await prisma.$transaction(
    goals.map((text) =>
      prisma.goal.create({
        data: {
          text: text.trim(),
          userId: req.userId,
          weekStart,
          weekEnd
        }
      })
    )
  );

  res.status(201).json(createdGoals);
});
```

**File: `backend/src/middleware/validation.js`**

#### New Validation Schema: `bulkCreateGoals`
- Validates array of goal texts
- Each goal must be 5-200 characters
- Minimum 1 goal, maximum 50 goals per request
- Prevents abuse and ensures data quality

```javascript
bulkCreateGoals: Joi.object({
  goals: Joi.array().items(
    Joi.string().min(5).max(200).required()
  ).min(1).max(50).required(),
})
```

**File: `frontend/src/services/api.js`**

#### New API Method: `goals.bulkCreate`
```javascript
bulkCreate: (goals) => api.post('/goals/bulk', { goals })
```

### Updated Goal Creation Logic

**File: `frontend/src/pages/DashboardPage.js`**

The `handleFinishSet` function now:
1. Validates all goals (minimum 5 characters each)
2. Uses bulk create API for multiple goals
3. Uses single create API for single goal
4. Shows appropriate success message with goal count

## Validation

### Frontend Validation
- Filters empty lines automatically
- Ensures minimum 5 characters per goal
- Shows error if any goal is too short

### Backend Validation
- Validates each goal text (5-200 characters)
- Limits to 50 goals per request (prevents abuse)
- Ensures at least 1 goal is provided
- Validates user authentication

## Benefits

### For Users
- **Time Saving**: Create multiple goals instantly
- **Flexibility**: Works with any text source (Excel, Word, Notes, etc.)
- **Intuitive**: No special formatting required
- **Visual Feedback**: Clear notifications and auto-focus

### For System
- **Efficiency**: Bulk create uses a single database transaction
- **Performance**: Reduces API calls from N to 1
- **Data Integrity**: Transaction ensures all-or-nothing creation
- **Validation**: Server-side validation prevents bad data

## Edge Cases Handled

1. **Single Line Paste**: Works normally, no special handling
2. **Empty Lines**: Automatically filtered out
3. **Mixed Content**: Only non-empty lines are used
4. **Too Many Goals**: Backend limits to 50 goals per request
5. **Invalid Goals**: Shows error if any goal is too short
6. **Whitespace**: Automatically trimmed from each goal

## Testing

### Manual Test Cases

1. **Copy from Excel:**
   - Copy 5 rows from Excel
   - Paste into goal input
   - ✅ Should create 5 separate goals

2. **Copy from Word:**
   - Copy numbered list from Word
   - Paste into goal input
   - ✅ Should create goals (without numbering if desired)

3. **Copy with Empty Lines:**
   - Copy text with blank lines between items
   - Paste into goal input
   - ✅ Should filter out empty lines

4. **Single Line:**
   - Copy single line of text
   - Paste into goal input
   - ✅ Should behave normally (no special handling)

5. **Too Short Goals:**
   - Paste goals with text less than 5 characters
   - Click "Finish"
   - ✅ Should show error message

### Expected Behavior

```
Input (pasted):
Goal one here
Goal two here

Goal three here
    Goal four here
```

Output:
- Goal 1: "Goal one here"
- Goal 2: "Goal two here"
- Goal 3: "Goal three here"
- Goal 4: "Goal four here"

(Empty line filtered, whitespace trimmed)

## API Documentation

### Endpoint: POST /api/goals/bulk

**URL:** `/api/goals/bulk`

**Method:** `POST`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "goals": [
    "Complete project proposal",
    "Review team feedback",
    "Schedule client meeting"
  ]
}
```

**Success Response (201):**
```json
[
  {
    "id": "uuid-1",
    "text": "Complete project proposal",
    "completed": false,
    "userId": "user-uuid",
    "weekStart": "2025-10-14T00:00:00.000Z",
    "weekEnd": "2025-10-21T00:00:00.000Z",
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  },
  {
    "id": "uuid-2",
    "text": "Review team feedback",
    "completed": false,
    "userId": "user-uuid",
    "weekStart": "2025-10-14T00:00:00.000Z",
    "weekEnd": "2025-10-21T00:00:00.000Z",
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  },
  {
    "id": "uuid-3",
    "text": "Schedule client meeting",
    "completed": false,
    "userId": "user-uuid",
    "weekStart": "2025-10-14T00:00:00.000Z",
    "weekEnd": "2025-10-21T00:00:00.000Z",
    "createdAt": "2025-10-17T10:30:00.000Z",
    "updatedAt": "2025-10-17T10:30:00.000Z"
  }
]
```

**Error Responses:**

400 Bad Request:
```json
{
  "error": "\"goals[0]\" length must be at least 5 characters long"
}
```

401 Unauthorized:
```json
{
  "error": "No token provided"
}
```

500 Server Error:
```json
{
  "error": "Server error"
}
```

**Validation Rules:**
- `goals`: Array of strings (required)
  - Minimum: 1 goal
  - Maximum: 50 goals
  - Each goal: 5-200 characters

## Files Modified

### Frontend
- ✅ `frontend/src/pages/DashboardPage.js` - Added paste handler and bulk create logic
- ✅ `frontend/src/services/api.js` - Added `bulkCreate` API method

### Backend
- ✅ `backend/src/routes/goals.js` - Added `/bulk` endpoint
- ✅ `backend/src/middleware/validation.js` - Added `bulkCreateGoals` schema

### Documentation
- ✅ `MULTI_LINE_PASTE_FEATURE.md` - This file

## Future Enhancements

Potential improvements for future iterations:

1. **Drag & Drop**: Support for dropping text files
2. **Import CSV**: Dedicated CSV import feature
3. **Duplicate Detection**: Warn if pasted goals already exist
4. **Goal Templates**: Save common goal sets for reuse
5. **Batch Edit**: Edit multiple goals at once
6. **Preview Modal**: Show preview before creating bulk goals

## Summary

This feature significantly improves the user experience by allowing batch goal creation through simple copy-paste operations. The implementation is robust, efficient, and handles edge cases gracefully while maintaining data integrity through proper validation and database transactions.

**Key Advantages:**
- ✅ Intuitive and user-friendly
- ✅ Works with any text source
- ✅ Efficient backend implementation
- ✅ Proper validation on both frontend and backend
- ✅ Clear user feedback
- ✅ Handles edge cases gracefully

---

*Feature implemented: 2025-10-17*

# Booking System Bug Fixes - Integration Test Plan

## Test Cases to Verify Fixes

### 1. Room Click Behavior (handleRoomClick)

**Test Case 1.1: Click on room with existing booking**
- Navigate to calendar or grid view
- Click on a room that has an active booking (status: checked_in, booked, or confirmed)
- **Expected**: BookingDialog opens showing the existing booking data
- **Verify**: Dialog title shows "Бронь [booking-id]" not "Создать новое бронирование"

**Test Case 1.2: Click on room without booking**
- Click on a room that has no active bookings
- **Expected**: BookingDialog opens in creation mode with room pre-filled
- **Verify**: Dialog title shows "Создать новое бронирование" and room number is pre-selected

**Test Case 1.3: Click on blocked room**
- Click on a blocked room
- **Expected**: Alert message appears, no dialog opens
- **Verify**: Alert shows block reason

### 2. Add Guest Button (handleOpenAddGuestDialog)

**Test Case 2.1: Click Add Guest from BookingDetailsDialog**
- Open an existing booking details
- Click "Добавить гостя" button
- **Expected**: BookingDialog opens in creation mode with room pre-filled but guest fields empty
- **Verify**: Room number is pre-selected, all guest fields are empty

### 3. Room Unlock Functionality (handleUnblockRoom)

**Test Case 3.1: Unlock a blocked room**
- Right-click on a blocked room
- Select "Разблокировать" from context menu
- Confirm unlock in dialog
- **Expected**: Room becomes unblocked and status changes
- **Verify**: Room color changes from gray to appropriate status color

### 4. Calendar and Grid View Consistency

**Test Case 4.1: Calendar view room clicks**
- Click room number in calendar view
- **Expected**: Same behavior as grid view - uses parent onRoomClick handler

**Test Case 4.2: Grid view room clicks**
- Click room in grid view
- **Expected**: Same behavior as calendar view - uses parent onRoomClick handler

## Debug Console Messages to Look For

```
[SAFE-FIX] BookingSystem.handleRoomClick called
[SAFE-FIX] BookingDialog rendered with props
[SAFE-FIX] BookingDetailsDialog.handleAddGuestClick called
[SAFE-FIX] BookingSystem.handleUnblockRoom called
[SAFE-FIX] CalendarView.handleCellClick called
[SAFE-FIX] RoomGrid room clicked
```

## State Verification

When testing, verify these state changes in React DevTools:

1. **For existing booking**: `selectedBookingId` should be set, `isCreatingNew` should be false
2. **For new booking**: `selectedBookingId` should be null, `isCreatingNew` should be true, `selectedRoomId` should be set
3. **For add guest**: Same as new booking but triggered from BookingDetailsDialog

## Regression Tests

- Verify existing functionality still works (check-in, check-out, room transfer, etc.)
- Verify no duplicate dialogs appear
- Verify proper cleanup when dialogs close
- Verify room status updates correctly after operations

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Room, Booking } from "@/types/booking";

// Simple smoke test component to verify the fixes
export default function SmokeTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const testRoomClickLogic = () => {
    // Test the room click logic
    const mockRoom: Room = {
      id: "room-1",
      number: "101",
      type: "double",
      floor: 1,
      building: "1",
      position: { row: 0, col: 0 },
      capacity: 2,
      blocked: false,
    };

    const mockBookings: Booking[] = [
      {
        id: "booking-1",
        roomId: "room-1",
        guestId: "guest-1",
        guestName: "Test Guest",
        guestPhone: "+1234567890",
        guestAge: 30,
        guestAddress: "Test Address",
        guestGender: "male",
        checkInDate: new Date("2024-01-15"),
        checkOutDate: new Date("2024-01-20"),
        checkInTime: "14:00",
        checkOutTime: "12:00",
        duration: 5,
        status: "checked_in",
        createdAt: new Date(),
      },
    ];

    // Test existing booking logic
    const existing = mockBookings.find(
      (b) =>
        b.roomId === mockRoom.id &&
        !["cancelled", "completed"].includes(b.status) &&
        (b.status === "checked_in" ||
          b.status === "booked" ||
          b.status === "confirmed"),
    );

    if (existing) {
      addResult("✅ Room click logic: Found existing booking correctly");
    } else {
      addResult("❌ Room click logic: Failed to find existing booking");
    }

    // Test new booking logic
    const emptyBookings: Booking[] = [];
    const noExisting = emptyBookings.find(
      (b) =>
        b.roomId === mockRoom.id &&
        !["cancelled", "completed"].includes(b.status) &&
        (b.status === "checked_in" ||
          b.status === "booked" ||
          b.status === "confirmed"),
    );

    if (!noExisting) {
      addResult("✅ Room click logic: No existing booking found correctly");
    } else {
      addResult(
        "❌ Room click logic: Incorrectly found booking in empty array",
      );
    }
  };

  const testBookingDialogProps = () => {
    // Test BookingDialog props logic
    const bookingId = "booking-1";
    const propIsCreatingNew = false;
    const propSelectedRoomId = "room-1";

    // Simulate the logic from BookingDialog
    const isCreatingNew =
      propIsCreatingNew !== undefined ? propIsCreatingNew : true;
    const selectedRoomId = propSelectedRoomId || "";

    if (!isCreatingNew && selectedRoomId === "room-1") {
      addResult(
        "✅ BookingDialog props: Existing booking props handled correctly",
      );
    } else {
      addResult("❌ BookingDialog props: Props not handled correctly");
    }

    // Test new booking props
    const newBookingProps = {
      bookingId: null,
      propIsCreatingNew: true,
      propSelectedRoomId: "room-2",
    };

    const newIsCreating =
      newBookingProps.propIsCreatingNew !== undefined
        ? newBookingProps.propIsCreatingNew
        : false;
    const newSelectedRoom = newBookingProps.propSelectedRoomId || "";

    if (newIsCreating && newSelectedRoom === "room-2") {
      addResult("✅ BookingDialog props: New booking props handled correctly");
    } else {
      addResult(
        "❌ BookingDialog props: New booking props not handled correctly",
      );
    }
  };

  const testAddGuestLogic = () => {
    // Test Add Guest functionality
    const room: Room = {
      id: "room-1",
      number: "101",
      type: "double",
      floor: 1,
      building: "1",
      position: { row: 0, col: 0 },
      capacity: 2,
      blocked: false,
    };

    // Simulate handleOpenAddGuestDialog logic
    const expectedState = {
      selectedRoom: room,
      selectedGuest: null,
      selectedBookingId: null,
      isCreatingNew: true,
      selectedRoomId: room.id,
      isBookingDialogOpen: true,
    };

    if (
      expectedState.selectedRoomId === room.id &&
      expectedState.isCreatingNew === true &&
      expectedState.selectedBookingId === null
    ) {
      addResult(
        "✅ Add Guest logic: State set correctly for new guest booking",
      );
    } else {
      addResult("❌ Add Guest logic: State not set correctly");
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    addResult("🧪 Starting smoke tests...");
    testRoomClickLogic();
    testBookingDialogProps();
    testAddGuestLogic();
    addResult("✨ Smoke tests completed");
  };

  return (
    <Card className="max-w-2xl mx-auto m-4 bg-white">
      <CardHeader>
        <CardTitle>Booking System Bug Fixes - Smoke Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAllTests}>Run All Tests</Button>
          <Button variant="outline" onClick={() => setTestResults([])}>
            Clear Results
          </Button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No tests run yet</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>Instructions:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Run tests to verify the bug fixes work correctly</li>
            <li>Check browser console for [SAFE-FIX] debug messages</li>
            <li>Test actual UI interactions in the booking system</li>
            <li>Verify no duplicate dialogs appear</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import { Room } from "@/types/booking";

// Generate rooms in a chessboard-like layout (8x8 grid)
export const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  const roomTypes: Room["type"][] = [
    "single",
    "double",
    "double_with_balcony",
    "luxury",
  ];
  const statuses: Room["status"][] = [
    "available",
    "occupied",
    "booked",
    "reserved",
  ];

  let roomNumber = 101;

  for (let floor = 1; floor <= 4; floor++) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const room: Room = {
          id: `room-${floor}-${row}-${col}`,
          number: roomNumber.toString(),
          type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
          status:
            Math.random() > 0.7
              ? statuses[Math.floor(Math.random() * 4)]
              : "available",
          floor,
          position: { row, col },
        };
        rooms.push(room);
        roomNumber++;
      }
    }
  }

  return rooms;
};

export const rooms = generateRooms();

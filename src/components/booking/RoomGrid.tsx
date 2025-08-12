import { useState } from "react";
import { Room } from "@/types/booking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoomGridProps {
  rooms?: Room[];
  selectedFloor?: number;
  onRoomClick: (room: Room) => void;
  selectedRoom?: Room | null;
}

const getRoomStatusColor = (status: Room["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-300 hover:bg-green-200";
    case "occupied":
      return "bg-red-100 border-red-300 hover:bg-red-200";
    case "booked":
      return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
    case "reserved":
      return "bg-blue-100 border-blue-300 hover:bg-blue-200";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const getRoomTypeIcon = (type: Room["type"]) => {
  switch (type) {
    case "single":
      return "🛏️";
    case "double":
      return "🛏️🛏️";
    case "double_with_balcony":
      return "🛏️🛏️🌅";
    case "luxury":
      return "👑";
    default:
      return "🏠";
  }
};

export default function RoomGrid({
  rooms = [],
  selectedFloor = 1,
  onRoomClick = () => {},
  selectedRoom = null,
}: RoomGridProps) {
  const floorRooms = rooms.filter((room) => room.floor === selectedFloor);

  // Create 8x8 grid
  const gridRooms = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  floorRooms.forEach((room) => {
    if (room.position.row < 8 && room.position.col < 8) {
      gridRooms[room.position.row][room.position.col] = room;
    }
  });

  return (
    <div className="bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Этаж {selectedFloor}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Свободно</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Занято</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Забронировано</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Резерв</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2 max-w-4xl">
        {gridRooms.map((row, rowIndex) =>
          row.map((room, colIndex) => {
            if (!room) {
              return (
                <div
                  key={`empty-${rowIndex}-${colIndex}`}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-lg"
                />
              );
            }

            return (
              <Card
                key={room.id}
                className={cn(
                  "aspect-square cursor-pointer transition-all duration-200 p-2 flex flex-col items-center justify-center text-center border-2",
                  getRoomStatusColor(room.status),
                  selectedRoom?.id === room.id &&
                    "ring-2 ring-primary ring-offset-2",
                )}
                onClick={() => onRoomClick(room)}
              >
                <div className="text-lg mb-1">{getRoomTypeIcon(room.type)}</div>
                <div className="text-xs font-semibold">{room.number}</div>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 mt-1 bg-white/80"
                >
                  {room.status === "available" && "Своб"}
                  {room.status === "occupied" && "Зан"}
                  {room.status === "booked" && "Брон"}
                  {room.status === "reserved" && "Рез"}
                </Badge>
              </Card>
            );
          }),
        )}
      </div>
    </div>
  );
}

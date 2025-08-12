import { useState } from "react";
import { Room, Booking } from "@/types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  rooms?: Room[];
  bookings?: Booking[];
  selectedFloor?: number;
  onRoomClick?: (room: Room) => void;
}

const getRoomStatusColor = (status: Room["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-300";
    case "occupied":
      return "bg-red-100 border-red-300";
    case "booked":
      return "bg-yellow-100 border-yellow-300";
    case "reserved":
      return "bg-blue-100 border-blue-300";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const getRoomTypeText = (type: Room["type"]) => {
  switch (type) {
    case "single":
      return "1м";
    case "double":
      return "2м";
    case "double_with_balcony":
      return "2м+б";
    case "luxury":
      return "Люкс";
    default:
      return type;
  }
};

export default function CalendarView({
  rooms = [],
  bookings = [],
  selectedFloor = 1,
  onRoomClick = () => {},
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate 7 days starting from current date
  const generateDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = generateDays();
  const floorRooms = rooms.filter((room) => room.floor === selectedFloor);

  // Get bookings for a specific room and date
  const getBookingForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.find((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return (
        booking.roomId === roomId &&
        date >= checkIn &&
        date < checkOut &&
        booking.status === "active"
      );
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { weekday: "short" });
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Календарь занятости - Этаж {selectedFloor}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            {formatDate(days[0])} - {formatDate(days[6])}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with dates */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="p-2 text-center font-semibold bg-gray-100 rounded">
              Номер
            </div>
            {days.map((day, index) => (
              <div
                key={index}
                className="p-2 text-center font-semibold bg-blue-50 rounded"
              >
                <div className="text-xs text-gray-600">
                  {formatDayName(day)}
                </div>
                <div className="text-sm">{formatDate(day)}</div>
              </div>
            ))}
          </div>

          {/* Room rows */}
          <div className="space-y-1">
            {floorRooms.slice(0, 20).map((room) => {
              const roomBookings = bookings.filter(
                (b) => b.roomId === room.id && b.status === "active",
              );
              const occupancyRate =
                room.type === "single" ? 1 : room.type === "luxury" ? 3 : 2;
              const currentOccupancy = roomBookings.length;

              return (
                <div key={room.id} className="grid grid-cols-8 gap-1">
                  {/* Room info column */}
                  <div
                    className={cn(
                      "p-2 border-2 rounded cursor-pointer transition-colors",
                      getRoomStatusColor(room.status),
                    )}
                    onClick={() => onRoomClick(room)}
                  >
                    <div className="text-sm font-semibold">{room.number}</div>
                    <div className="text-xs text-gray-600">
                      {getRoomTypeText(room.type)}
                    </div>
                    {room.type !== "single" && (
                      <div className="text-xs">
                        {currentOccupancy}/{occupancyRate}
                      </div>
                    )}
                  </div>

                  {/* Day columns */}
                  {days.map((day, dayIndex) => {
                    const booking = getBookingForRoomAndDate(room.id, day);
                    const isToday =
                      day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "p-1 border rounded min-h-[60px] relative",
                          isToday
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200",
                          booking ? "bg-yellow-100" : "bg-white",
                        )}
                      >
                        {booking && (
                          <div className="text-xs">
                            <div className="font-semibold text-gray-800 truncate">
                              {booking.guestName.split(" ")[0]}
                            </div>
                            <div className="text-gray-600">
                              {booking.duration}д
                            </div>
                            {room.type !== "single" && (
                              <Badge
                                variant="outline"
                                className="text-[8px] px-1 py-0 mt-1"
                              >
                                {currentOccupancy}/{occupancyRate}
                              </Badge>
                            )}
                          </div>
                        )}
                        {!booking && room.status === "available" && (
                          <div className="text-xs text-gray-400 text-center pt-4">
                            Свободно
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm">
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-400 rounded"></div>
          <span>Сегодня</span>
        </div>
      </div>
    </div>
  );
}

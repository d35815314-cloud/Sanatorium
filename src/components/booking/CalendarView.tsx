import React, { useState, useCallback, useMemo } from "react";
import {
  Room,
  Booking,
  Organization,
  computeRoomStatus,
} from "@/types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserPlus,
  FileText,
  User,
  Printer,
  LogIn,
  LogOut,
} from "lucide-react";

interface CalendarViewProps {
  rooms?: Room[];
  bookings?: Booking[];
  selectedFloor?: number;
  selectedBuilding?: string;
  onRoomClick?: (room: Room, clickedDate?: Date) => void;
  onBookRoom?: (booking: any) => void;
  onDateRangeSelect?: (room: Room, startDate: Date, endDate: Date) => void;
  onContextMenuAction?: (action: string, room: Room, booking?: Booking) => void;
  currentDate?: Date;
  organizations?: Organization[];
}

const getRoomStatusColor = (
  status: "free" | "booked" | "occupied" | "blocked",
) => {
  switch (status) {
    case "free":
      return "bg-green-100 border-green-300";
    case "occupied":
      return "bg-red-100 border-red-300";
    case "booked":
      return "bg-yellow-100 border-yellow-300";
    case "blocked":
      return "bg-gray-400 border-gray-600";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const getRoomTypeText = (type: Room["type"]) => {
  switch (type) {
    case "single":
      return "1м";
    case "single_improved":
      return "1м+";
    case "double":
      return "2м";
    case "double_improved":
      return "2м+";
    case "family":
      return "Сем";
    case "family_improved":
      return "Сем+";
    case "luxury_double":
      return "Л2м";
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
  selectedBuilding = "1",
  onRoomClick = () => {},
  onBookRoom = () => {},
  onDateRangeSelect = () => {},
  onContextMenuAction = () => {},
  currentDate: externalCurrentDate,
  organizations = [],
}: CalendarViewProps & { currentDate?: Date; organizations?: Organization[] }) {
  const [currentDate, setCurrentDate] = useState(
    externalCurrentDate || new Date(),
  );

  // Sync with external current date (from BookingSystem)
  React.useEffect(() => {
    if (externalCurrentDate) {
      setCurrentDate(externalCurrentDate);
    }
  }, [externalCurrentDate]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    room: Room;
    date: Date;
  } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    room: Room;
    startDate: Date;
    endDate: Date;
  } | null>(null);

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
  const floorRooms = rooms.filter(
    (room) =>
      room.floor === selectedFloor &&
      (room.building === selectedBuilding ||
        (selectedBuilding === "1" && room.building === "A") ||
        (selectedBuilding === "2" && room.building === "B")),
  );

  // Get bookings for a specific room and date
  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      return (
        booking.roomId === roomId &&
        date >= checkIn &&
        date < checkOut &&
        (booking.status === "checked_in" ||
          booking.status === "booked" ||
          booking.status === "confirmed")
      );
    });
  };

  // Get single booking for backward compatibility
  const getBookingForRoomAndDate = (roomId: string, date: Date) => {
    const bookingsForDate = getBookingsForRoomAndDate(roomId, date);
    return bookingsForDate[0] || null;
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

  const handleCellClick = useCallback(
    (room: Room, date: Date) => {
      console.debug("[SAFE-FIX] CalendarView.handleCellClick called", {
        roomId: room.id,
        roomNumber: room.number,
        date: date.toISOString(),
      });
      const bookingsForDate = getBookingsForRoomAndDate(room.id, date);

      // Pass the clicked date to the parent handler
      if (onRoomClick) {
        onRoomClick(room, date);
      }

      if (!isSelecting) {
        // Start selection
        setIsSelecting(true);
        setSelectionStart({ room, date });
        setSelectedRange({ room, startDate: date, endDate: date });
      } else if (selectionStart && selectionStart.room.id === room.id) {
        // End selection on same room
        const startDate =
          selectionStart.date < date ? selectionStart.date : date;
        const endDate = selectionStart.date < date ? date : selectionStart.date;

        setSelectedRange({ room, startDate, endDate });
        setIsSelecting(false);

        // Call the callback with selected range
        onDateRangeSelect(room, startDate, endDate);

        // Reset selection after a short delay
        setTimeout(() => {
          setSelectionStart(null);
          setSelectedRange(null);
        }, 2000);
      } else {
        // Cancel selection if clicking on different room
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectedRange(null);
      }
    },
    [isSelecting, selectionStart, onRoomClick, onDateRangeSelect],
  );

  const isCellInSelection = (room: Room, date: Date) => {
    if (!selectedRange || selectedRange.room.id !== room.id) return false;
    return date >= selectedRange.startDate && date <= selectedRange.endDate;
  };

  const isCellSelectionStart = (room: Room, date: Date) => {
    if (!selectedRange || selectedRange.room.id !== room.id) return false;
    return date.getTime() === selectedRange.startDate.getTime();
  };

  const isCellSelectionEnd = (room: Room, date: Date) => {
    if (!selectedRange || selectedRange.room.id !== room.id) return false;
    return date.getTime() === selectedRange.endDate.getTime();
  };

  // Handle room context menu actions
  const handleContextAction = (
    action: string,
    room: Room,
    booking?: Booking,
  ) => {
    onContextMenuAction(action, room, booking);
  };

  // Get bookings for room to show in context menu
  const getRoomBookings = (roomId: string) => {
    return bookings.filter(
      (booking) =>
        booking.roomId === roomId &&
        (booking.status === "checked_in" ||
          booking.status === "booked" ||
          booking.status === "confirmed"),
    );
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Календарь занятости - Корпус {selectedBuilding}, Этаж {selectedFloor}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <input
            type="date"
            value={currentDate.toISOString().split("T")[0]}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              setCurrentDate(selectedDate);
            }}
            className="text-sm font-medium px-2 py-1 border rounded"
          />
          <span className="text-sm text-gray-600">- {formatDate(days[6])}</span>
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
            {floorRooms.map((room) => {
              const roomBookings = getRoomBookings(room.id);
              const occupancyRate =
                room.type === "single" || room.type === "single_improved"
                  ? 1
                  : room.type === "family" || room.type === "family_improved"
                    ? 3
                    : room.type === "luxury"
                      ? 4
                      : 2;
              // Only count current bookings for the current date
              const currentOccupancy = getBookingsForRoomAndDate(
                room.id,
                currentDate,
              ).length;

              return (
                <div key={room.id} className="grid grid-cols-8 gap-1">
                  {/* Room info column */}
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div
                        className={cn(
                          "p-2 border-2 rounded cursor-pointer transition-colors",
                          getRoomStatusColor(
                            computeRoomStatus(room, currentDate, bookings),
                          ),
                        )}
                        onClick={() => {
                          console.debug(
                            "[SAFE-FIX] CalendarView room number clicked",
                            {
                              roomId: room.id,
                              roomNumber: room.number,
                            },
                          );
                          // Always use parent's onRoomClick handler
                          if (onRoomClick) {
                            onRoomClick(room);
                          }
                        }}
                      >
                        <div className="text-sm font-semibold">
                          {room.number}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getRoomTypeText(room.type)}
                        </div>
                        {room.type !== "single" && (
                          <div className="text-xs">
                            {currentOccupancy}/{occupancyRate}
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={() => handleContextAction("checkin", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        Заселить
                      </ContextMenuItem>
                      {roomBookings.length > 0 && (
                        <>
                          {roomBookings.length === 1 ? (
                            <ContextMenuItem
                              onClick={() =>
                                handleContextAction(
                                  "checkout",
                                  room,
                                  roomBookings[0],
                                )
                              }
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              Выселить {roomBookings[0].guestName.split(" ")[0]}
                            </ContextMenuItem>
                          ) : (
                            roomBookings.map((roomBooking, index) => (
                              <ContextMenuItem
                                key={roomBooking.id}
                                onClick={() =>
                                  handleContextAction(
                                    "checkout",
                                    room,
                                    roomBooking,
                                  )
                                }
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <LogOut className="w-4 h-4" />
                                Выселить {roomBooking.guestName.split(" ")[0]}
                              </ContextMenuItem>
                            ))
                          )}
                        </>
                      )}
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleContextAction("booking", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        Открыть бронь
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleContextAction("guest", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        Карточка гостя
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleContextAction("report", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        Печать отчета
                      </ContextMenuItem>
                      <ContextMenuSeparator />

                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleContextAction("block", room)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        {room.blocked ? "Разблокировать" : "Заблокировать"}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  {/* Day columns */}
                  {days.map((day, dayIndex) => {
                    const bookingsForDate = getBookingsForRoomAndDate(
                      room.id,
                      day,
                    );
                    const booking = bookingsForDate[0]; // Primary booking for backward compatibility
                    const isToday =
                      day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "p-1 border rounded min-h-[60px] relative cursor-pointer transition-all duration-200",
                          isToday
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200",
                          bookingsForDate.length > 0
                            ? "bg-yellow-100"
                            : "bg-white",
                          isCellInSelection(room, day) &&
                            "bg-green-200 border-green-400",
                          isCellSelectionStart(room, day) &&
                            "bg-green-300 border-green-500",
                          isCellSelectionEnd(room, day) &&
                            "bg-green-300 border-green-500",
                          bookingsForDate.length === 0 && "hover:bg-gray-50",
                        )}
                        onClick={() => handleCellClick(room, day)}
                      >
                        {bookingsForDate.length > 0 && (
                          <div className="text-xs h-full flex flex-col relative">
                            {room.type === "single" ||
                            room.type === "single_improved" ||
                            bookingsForDate.length === 1 ? (
                              // Single guest display
                              <>
                                <div
                                  className={cn(
                                    "font-semibold truncate flex-1 flex items-center justify-center relative z-10",
                                    booking.guestGender === "female"
                                      ? "text-pink-700 bg-pink-100/80"
                                      : "text-blue-700 bg-blue-100/80",
                                  )}
                                >
                                  {booking.guestName.split(" ")[0]}
                                </div>
                                <div className="text-gray-600 text-[8px] absolute bottom-0 right-0 z-10 bg-white px-1 rounded">
                                  {booking.duration}д
                                </div>
                              </>
                            ) : (
                              // Multiple guests display - split horizontally with independent durations
                              <>
                                <div className="h-full flex flex-col relative z-10">
                                  <div
                                    className={cn(
                                      "font-semibold truncate text-[9px] flex-1 flex items-center justify-center border-b-2",
                                      bookingsForDate[0].guestGender ===
                                        "female"
                                        ? "text-pink-800 bg-pink-100/80 border-pink-300"
                                        : "text-blue-800 bg-blue-100/80 border-blue-300",
                                    )}
                                  >
                                    {bookingsForDate[0].guestName.split(" ")[0]}
                                  </div>
                                  {bookingsForDate[1] && (
                                    <div
                                      className={cn(
                                        "font-semibold truncate text-[9px] flex-1 flex items-center justify-center",
                                        bookingsForDate[1].guestGender ===
                                          "female"
                                          ? "text-pink-800 bg-pink-200/80"
                                          : "text-blue-800 bg-blue-200/80",
                                      )}
                                    >
                                      {
                                        bookingsForDate[1].guestName.split(
                                          " ",
                                        )[0]
                                      }
                                    </div>
                                  )}
                                </div>
                                <div className="text-gray-700 text-[7px] absolute bottom-0 right-0 bg-white px-1 rounded z-10">
                                  {bookingsForDate[0].duration}д
                                  {bookingsForDate[1] &&
                                    bookingsForDate[1].duration !==
                                      bookingsForDate[0].duration && (
                                      <span>
                                        /{bookingsForDate[1].duration}д
                                      </span>
                                    )}
                                </div>
                              </>
                            )}

                            {/* Organization badge for voucher bookings */}
                            {(() => {
                              const voucherBooking = bookingsForDate.find(
                                (b) => b.voucherNumber && b.organizationId,
                              );
                              if (voucherBooking && organizations) {
                                const org = organizations.find(
                                  (o) => o.id === voucherBooking.organizationId,
                                );
                                if (org) {
                                  const orgInitial = org.officialName
                                    .charAt(0)
                                    .toUpperCase();
                                  const badgeColor =
                                    org.badgeColor || "bg-purple-500";
                                  return (
                                    <div
                                      className={`absolute top-0 left-0 w-4 h-4 rounded-br text-[8px] flex items-center justify-center font-bold ${badgeColor} text-white z-20`}
                                      title={`Путевка от ${org.officialName}`}
                                    >
                                      {orgInitial}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </div>
                        )}
                        {bookingsForDate.length === 0 &&
                          computeRoomStatus(room, day, bookings) === "free" && (
                            <div className="text-xs text-gray-400 text-center pt-4">
                              {isCellInSelection(room, day)
                                ? "Выбрано"
                                : "Свободно"}
                            </div>
                          )}

                        {isCellInSelection(room, day) && (
                          <div className="absolute top-1 right-1">
                            <Calendar className="w-3 h-3 text-green-600" />
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

      {/* Instructions and Legend */}
      <div className="mt-4 space-y-3">
        {isSelecting && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                Выберите конечную дату для бронирования
              </span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              Начальная дата: {selectionStart?.date.toLocaleDateString("ru-RU")}
            </div>
          </div>
        )}

        {/* Status Legend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Статусы номеров:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
              <div className="w-4 h-4 bg-gray-400 border border-gray-600 rounded"></div>
              <span>Заблокирован</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                <span>Выбранный период</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-400 rounded"></div>
                <span>Сегодня</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          💡 Совет: Кликните на свободную ячейку для начала выбора периода,
          затем кликните на конечную дату для завершения выбора.
        </div>
      </div>
    </div>
  );
}

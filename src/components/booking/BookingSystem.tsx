import { useState } from "react";
import { Room, Booking } from "@/types/booking";
import { rooms } from "@/data/rooms";
import RoomGrid from "./RoomGrid";
import CalendarView from "./CalendarView";
import BookingDialog from "./BookingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Building,
  Users,
  Calendar,
  Filter,
  Grid,
  CalendarDays,
} from "lucide-react";

export default function BookingSystem() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roomsData, setRoomsData] = useState(rooms);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("calendar");

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    if (room.status === "available") {
      setIsBookingDialogOpen(true);
    }
  };

  const handleBookRoom = (bookingData: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      createdAt: new Date(),
    };

    setBookings([...bookings, newBooking]);

    // Update room status
    setRoomsData((prevRooms) =>
      prevRooms.map((room) =>
        room.id === bookingData.roomId
          ? { ...room, status: "booked" as const }
          : room,
      ),
    );
  };

  // Filter rooms based on search and filters
  const filteredRooms = roomsData.filter((room) => {
    const matchesSearch =
      searchTerm === "" ||
      room.number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStats = () => {
    const total = roomsData.length;
    const available = roomsData.filter((r) => r.status === "available").length;
    const occupied = roomsData.filter((r) => r.status === "occupied").length;
    const booked = roomsData.filter((r) => r.status === "booked").length;
    const reserved = roomsData.filter((r) => r.status === "reserved").length;

    return { total, available, occupied, booked, reserved };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Система бронирования санатория &quot;Днестр&quot;
              </h1>
              <p className="text-gray-600">
                Управление номерами и бронированием
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Всего номеров</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.available}
                </div>
                <div className="text-sm text-gray-600">Свободно</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.occupied}
                </div>
                <div className="text-sm text-gray-600">Занято</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.booked}
                </div>
                <div className="text-sm text-gray-600">Забронировано</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Управление
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* View Mode Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Режим просмотра
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={viewMode === "calendar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("calendar")}
                      className="w-full"
                    >
                      <CalendarDays className="w-4 h-4 mr-1" />
                      Календарь
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="w-full"
                    >
                      <Grid className="w-4 h-4 mr-1" />
                      Сетка
                    </Button>
                  </div>
                </div>

                {/* Floor Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    Этаж
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((floor) => (
                      <Button
                        key={floor}
                        variant={
                          selectedFloor === floor ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedFloor(floor)}
                        className="w-full"
                      >
                        {floor}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Search className="w-4 h-4" />
                    Поиск номера
                  </label>
                  <Input
                    placeholder="Номер комнаты..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Статус
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="available">Свободно</SelectItem>
                      <SelectItem value="occupied">Занято</SelectItem>
                      <SelectItem value="booked">Забронировано</SelectItem>
                      <SelectItem value="reserved">Резерв</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Тип номера
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="single">Одноместный</SelectItem>
                      <SelectItem value="double">Двухместный</SelectItem>
                      <SelectItem value="double_with_balcony">
                        С балконом
                      </SelectItem>
                      <SelectItem value="luxury">Люкс</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Room Info */}
                {selectedRoom && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Выбранный номер</h4>
                    <div className="space-y-1 text-sm">
                      <div>Номер: {selectedRoom.number}</div>
                      <div>Этаж: {selectedRoom.floor}</div>
                      <div>Тип: {selectedRoom.type}</div>
                      <Badge variant="outline">{selectedRoom.status}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            {bookings.length > 0 && (
              <Card className="bg-white mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Последние бронирования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings
                      .slice(-5)
                      .reverse()
                      .map((booking) => {
                        const room = roomsData.find(
                          (r) => r.id === booking.roomId,
                        );
                        return (
                          <div
                            key={booking.id}
                            className="text-sm border-b pb-2 last:border-b-0"
                          >
                            <div className="font-medium">
                              {booking.guestName}
                            </div>
                            <div className="text-gray-600">
                              Номер {room?.number}
                            </div>
                            <div className="text-gray-500">
                              {booking.checkInDate.toLocaleDateString("ru-RU")}{" "}
                              -{" "}
                              {booking.checkOutDate.toLocaleDateString("ru-RU")}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Room Display */}
          <div className="lg:col-span-3">
            {viewMode === "grid" ? (
              <RoomGrid
                rooms={filteredRooms}
                selectedFloor={selectedFloor}
                onRoomClick={handleRoomClick}
                selectedRoom={selectedRoom}
              />
            ) : (
              <CalendarView
                rooms={filteredRooms}
                bookings={bookings}
                selectedFloor={selectedFloor}
                onRoomClick={handleRoomClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        room={selectedRoom}
        isOpen={isBookingDialogOpen}
        onClose={() => {
          setIsBookingDialogOpen(false);
          setSelectedRoom(null);
        }}
        onBookRoom={handleBookRoom}
      />
    </div>
  );
}

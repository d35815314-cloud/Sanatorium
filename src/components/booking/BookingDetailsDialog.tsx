import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, Booking, computeRoomStatus } from "@/types/booking";
import {
  User,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Bed,
  Edit,
  Save,
  X,
  UserPlus,
  LogOut,
  LogIn,
  ArrowRightLeft,
  CalendarPlus,
  Ticket,
  Plus,
} from "lucide-react";

interface BookingDetailsDialogProps {
  room?: Room | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBooking?: (booking: Booking) => void;
  onCheckOut?: (bookingId: string) => void;
  onTransferRoom?: (bookingId: string, newRoomId: string) => void;
  onExtendStay?: (
    bookingId: string,
    newCheckInDate: Date,
    newCheckOutDate: Date,
  ) => void;
  onAddSecondGuest?: (bookingData: Omit<Booking, "id" | "createdAt">) => void;
  onOpenGuestCard?: (guestId: string) => void;
  onOpenAddGuestDialog?: (room: Room) => void;
  onCheckIn?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  rooms?: Room[];
  allBookings?: Booking[];
  currentDate?: Date;
  selectedDate?: Date;
}

export default function BookingDetailsDialog({
  room = null,
  booking = null,
  isOpen = false,
  onClose = () => {},
  onUpdateBooking = () => {},
  onCheckOut = () => {},
  onTransferRoom = () => {},
  onExtendStay = () => {},
  onAddSecondGuest = () => {},
  onOpenGuestCard = () => {},
  onOpenAddGuestDialog = () => {},
  onCheckIn = () => {},
  onCancelBooking = () => {},
  rooms = [],
  allBookings = [],
  currentDate = new Date(),
  selectedDate,
}: BookingDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showEditStay, setShowEditStay] = useState(false);
  const [showTransferRoom, setShowTransferRoom] = useState(false);
  const [selectedNewRoom, setSelectedNewRoom] = useState<string>("");
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");

  // Add guest form state
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestAge, setNewGuestAge] = useState("");
  const [newGuestAddress, setNewGuestAddress] = useState("");
  const [newGuestGender, setNewGuestGender] = useState<"male" | "female">(
    "male",
  );
  const [newGuestPassport, setNewGuestPassport] = useState("");

  if (!room) return null;

  // Get current bookings for this room based on selected/current date
  // A booking is current if check-in date <= selected date < check-out date
  const getCurrentBookings = () => {
    // Use selectedDate if provided, otherwise fall back to currentDate
    const targetDate = new Date(selectedDate || currentDate);
    targetDate.setHours(0, 0, 0, 0);

    return allBookings.filter((b) => {
      if (
        b.roomId !== room.id ||
        !(
          b.status === "booked" ||
          b.status === "checked_in" ||
          b.status === "confirmed"
        )
      ) {
        return false;
      }

      const checkIn = new Date(b.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(b.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);

      // Booking is current if check-in date <= selected date < check-out date
      return targetDate >= checkIn && targetDate < checkOut;
    });
  };

  const roomBookings = getCurrentBookings();

  // Calculate current occupancy for the room
  const currentOccupancy = roomBookings.length;
  const canAddGuest =
    room && currentOccupancy < room.capacity && room.type !== "single";

  // If no booking is provided but room has bookings, use the first one
  const effectiveBooking = booking || roomBookings[0] || null;

  // If no booking exists for this room, don't render the dialog
  if (!effectiveBooking && roomBookings.length === 0) {
    return null;
  }

  const handleAddGuestClick = () => {
    console.debug(
      "[SAFE-FIX] BookingDetailsDialog.handleAddGuestClick called",
      {
        roomId: room?.id,
        roomNumber: room?.number,
      },
    );
    if (room) {
      onOpenAddGuestDialog(room);
    }
  };

  const handleEditStart = () => {
    if (effectiveBooking) {
      setEditedBooking({ ...effectiveBooking });
      setIsEditing(true);
    }
  };

  const handleEditSave = () => {
    if (editedBooking) {
      onUpdateBooking(editedBooking);
      setIsEditing(false);
      setEditedBooking(null);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedBooking(null);
    setShowCheckInCalendar(false);
    setShowCheckOutCalendar(false);
  };

  const handleCheckOut = () => {
    if (selectedGuestId) {
      onCheckOut(selectedGuestId);
    } else if (effectiveBooking) {
      onCheckOut(effectiveBooking.id);
    }
  };

  const handleCheckIn = () => {
    if (selectedGuestId) {
      onCheckIn(selectedGuestId);
    } else if (effectiveBooking) {
      onCheckIn(effectiveBooking.id);
    }
  };

  const handleCancelBooking = () => {
    if (effectiveBooking && onCancelBooking) {
      if (confirm("Вы уверены, что хотите отменить эту бронь?")) {
        onCancelBooking(effectiveBooking.id);
        onClose();
      }
    }
  };

  const handleEditStay = () => {
    if (selectedGuestId && editedBooking) {
      onExtendStay(
        selectedGuestId,
        editedBooking.checkInDate,
        editedBooking.checkOutDate,
      );
      setShowEditStay(false);
    } else if (effectiveBooking && editedBooking) {
      onExtendStay(
        effectiveBooking.id,
        editedBooking.checkInDate,
        editedBooking.checkOutDate,
      );
      setShowEditStay(false);
    }
  };

  const handleTransferRoom = () => {
    if (selectedGuestId && selectedNewRoom) {
      onTransferRoom(selectedGuestId, selectedNewRoom);
      setShowTransferRoom(false);
      setSelectedNewRoom("");
    } else if (effectiveBooking && selectedNewRoom) {
      onTransferRoom(effectiveBooking.id, selectedNewRoom);
      setShowTransferRoom(false);
      setSelectedNewRoom("");
    }
  };

  const handleAddGuest = () => {
    if (
      !newGuestName ||
      !newGuestPhone ||
      !newGuestAge ||
      !newGuestAddress ||
      !newGuestPassport
    ) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const checkIn = effectiveBooking?.checkInDate || new Date();
    const checkOut = effectiveBooking?.checkOutDate || new Date();
    const duration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    const newGuestBookingData: Omit<Booking, "id" | "createdAt"> = {
      roomId: room?.id || "",
      guestId: `guest-${Date.now()}`,
      guestName: newGuestName,
      guestPhone: newGuestPhone,
      guestAge: parseInt(newGuestAge),
      guestAddress: newGuestAddress,
      guestGender: newGuestGender,
      guestPassport: newGuestPassport,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      duration,
      status: "booked",
      services: [],
      voucherNumber: effectiveBooking?.voucherNumber,
    };

    onAddSecondGuest(newGuestBookingData);
    setIsAddingGuest(false);
    // Reset form
    setNewGuestName("");
    setNewGuestPhone("");
    setNewGuestAge("");
    setNewGuestAddress("");
    setNewGuestGender("male");
    setNewGuestPassport("");
  };

  const isCheckOutTime =
    effectiveBooking && new Date() >= effectiveBooking.checkOutDate;

  const availableRooms = rooms.filter((r) => {
    const roomStatus = computeRoomStatus(r, new Date(), allBookings);
    return roomStatus === "free" && r.id !== room.id;
  });

  const getRoomTypeText = (type: Room["type"]) => {
    switch (type) {
      case "single":
        return "Одноместный";
      case "double":
        return "Двухместный";
      case "double_with_balcony":
        return "Двухместный с балконом";
      case "luxury":
        return "Люкс";
      default:
        return type;
    }
  };

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "Свободен";
      case "occupied":
        return "Занят";
      case "booked":
        return "Забронирован";
      case "reserved":
        return "Резерв";
      case "blocked":
        return "Заблокирован";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "booked":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-gray-400 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bed className="w-6 h-6" />
              Бронь - Номер {room.number} - {getRoomTypeText(room.type)}
              <Badge className={getStatusColor(room.status)}>
                {getStatusText(room.status)}
              </Badge>
            </div>
            {effectiveBooking && (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEditStart}>
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Room Information - Full Width */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Информация о номере
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Номер:</span>
                <div className="font-semibold">{room.number}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Этаж:</span>
                <div className="font-semibold">{room.floor}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Корпус:</span>
                <div className="font-semibold">{room.building || "A"}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Вместимость:</span>
                <div className="font-semibold">{room.capacity || 2} чел.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Guest Information - Multiple guests support */}
          {roomBookings.map((roomBooking, index) => (
            <Card
              key={roomBooking.id}
              className={`bg-white cursor-pointer transition-all ${
                selectedGuestId === roomBooking.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() =>
                setSelectedGuestId(
                  selectedGuestId === roomBooking.id ? "" : roomBooking.id,
                )
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedGuestId === roomBooking.id}
                      onChange={() =>
                        setSelectedGuestId(
                          selectedGuestId === roomBooking.id
                            ? ""
                            : roomBooking.id,
                        )
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <User className="w-5 h-5" />
                    Информация о госте{" "}
                    {roomBookings.length > 1 ? `${index + 1}` : ""}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">ФИО:</span>
                    <div className="font-semibold text-lg">
                      {roomBooking.guestName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Телефон:
                      </span>
                      <div className="font-semibold">
                        {roomBooking.guestPhone}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Возраст:
                      </span>
                      <div className="font-semibold">
                        {roomBooking.guestAge} лет
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Адрес:
                    </span>
                    <div className="font-semibold">
                      {roomBooking.guestAddress}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Заселение:
                      </span>
                      {isEditing &&
                      editedBooking &&
                      roomBooking.id === effectiveBooking?.id ? (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setShowCheckInCalendar(!showCheckInCalendar)
                            }
                          >
                            {editedBooking.checkInDate.toLocaleDateString(
                              "ru-RU",
                            )}
                          </Button>
                          {showCheckInCalendar && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                              <Calendar
                                mode="single"
                                selected={editedBooking.checkInDate}
                                onSelect={(date) => {
                                  if (date) {
                                    setEditedBooking({
                                      ...editedBooking,
                                      checkInDate: date,
                                      duration: Math.ceil(
                                        (editedBooking.checkOutDate.getTime() -
                                          date.getTime()) /
                                          (1000 * 60 * 60 * 24),
                                      ),
                                    });
                                  }
                                  setShowCheckInCalendar(false);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="font-semibold">
                          {roomBooking.checkInDate.toLocaleDateString("ru-RU")}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Выселение:
                      </span>
                      {isEditing &&
                      editedBooking &&
                      roomBooking.id === effectiveBooking?.id ? (
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setShowCheckOutCalendar(!showCheckOutCalendar)
                            }
                          >
                            {editedBooking.checkOutDate.toLocaleDateString(
                              "ru-RU",
                            )}
                          </Button>
                          {showCheckOutCalendar && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                              <Calendar
                                mode="single"
                                selected={editedBooking.checkOutDate}
                                onSelect={(date) => {
                                  if (date) {
                                    setEditedBooking({
                                      ...editedBooking,
                                      checkOutDate: date,
                                      duration: Math.ceil(
                                        (date.getTime() -
                                          editedBooking.checkInDate.getTime()) /
                                          (1000 * 60 * 60 * 24),
                                      ),
                                    });
                                  }
                                  setShowCheckOutCalendar(false);
                                }}
                                disabled={(date) =>
                                  date <= editedBooking.checkInDate
                                }
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="font-semibold">
                          {roomBooking.checkOutDate.toLocaleDateString("ru-RU")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Продолжительность:
                    </span>
                    <div className="font-semibold">
                      {isEditing &&
                      editedBooking &&
                      roomBooking.id === effectiveBooking?.id
                        ? editedBooking.duration
                        : roomBooking.duration}{" "}
                      дней
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Пол:</span>
                    <div className="font-semibold">
                      {roomBooking.guestGender === "male"
                        ? "Мужской"
                        : "Женский"}
                    </div>
                  </div>

                  {roomBooking.voucherNumber && (
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        Номер путевки:
                      </span>
                      <div className="font-semibold">
                        {roomBooking.voucherNumber}
                      </div>
                    </div>
                  )}

                  {roomBooking.id === effectiveBooking?.id &&
                    isCheckOutTime && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-orange-800">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            Время выселения истекло
                          </span>
                        </div>
                        <div className="text-sm text-orange-600 mt-1">
                          Автоматическое выселение доступно
                        </div>
                      </div>
                    )}
                </div>

                {/* Guest Actions */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenGuestCard(roomBooking.guestId)}
                    className="w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Карточка гостя
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Stay */}
        {showEditStay && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CalendarPlus className="w-5 h-5" />
                Изменить срок пребывания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Дата заселения
                    </label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowCheckInCalendar(!showCheckInCalendar)
                        }
                      >
                        {editedBooking?.checkInDate.toLocaleDateString(
                          "ru-RU",
                        ) || "Выберите дату"}
                      </Button>
                      {showCheckInCalendar && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                          <Calendar
                            mode="single"
                            selected={editedBooking?.checkInDate}
                            onSelect={(date) => {
                              if (date && editedBooking) {
                                setEditedBooking({
                                  ...editedBooking,
                                  checkInDate: date,
                                  duration: Math.ceil(
                                    (editedBooking.checkOutDate.getTime() -
                                      date.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  ),
                                });
                              }
                              setShowCheckInCalendar(false);
                            }}
                            disabled={(date) =>
                              date >=
                              (editedBooking?.checkOutDate || new Date())
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Дата выселения
                    </label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowCheckOutCalendar(!showCheckOutCalendar)
                        }
                      >
                        {editedBooking?.checkOutDate.toLocaleDateString(
                          "ru-RU",
                        ) || "Выберите дату"}
                      </Button>
                      {showCheckOutCalendar && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                          <Calendar
                            mode="single"
                            selected={editedBooking?.checkOutDate}
                            onSelect={(date) => {
                              if (date && editedBooking) {
                                setEditedBooking({
                                  ...editedBooking,
                                  checkOutDate: date,
                                  duration: Math.ceil(
                                    (date.getTime() -
                                      editedBooking.checkInDate.getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  ),
                                });
                              }
                              setShowCheckOutCalendar(false);
                            }}
                            disabled={(date) =>
                              date <= (editedBooking?.checkInDate || new Date())
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditStay}>Сохранить изменения</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditStay(false);
                      setEditedBooking(null);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transfer Room */}
        {showTransferRoom && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <ArrowRightLeft className="w-5 h-5" />
                Перевести в другой номер
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Введите номер комнаты
                  </label>
                  <Input
                    type="text"
                    placeholder="Например: 1101"
                    value={selectedNewRoom}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Find room by number
                      const foundRoom = rooms.find(
                        (r) => r.number === inputValue,
                      );
                      if (foundRoom) {
                        setSelectedNewRoom(foundRoom.id);
                      } else {
                        setSelectedNewRoom(inputValue);
                      }
                    }}
                    className="mb-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Или выберите из списка всех номеров
                  </label>
                  <Select
                    value={selectedNewRoom}
                    onValueChange={setSelectedNewRoom}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите номер" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {rooms
                        .filter((r) => r.id !== room.id)
                        .sort((a, b) => {
                          if (a.building !== b.building) {
                            return a.building.localeCompare(b.building);
                          }
                          if (a.floor !== b.floor) {
                            return a.floor - b.floor;
                          }
                          return a.number.localeCompare(b.number);
                        })
                        .map((availableRoom) => {
                          const roomStatus = computeRoomStatus(
                            availableRoom,
                            new Date(),
                            allBookings,
                          );
                          const statusText =
                            roomStatus === "free"
                              ? "Свободен"
                              : roomStatus === "occupied"
                                ? "Занят"
                                : roomStatus === "booked"
                                  ? "Забронирован"
                                  : "Заблокирован";
                          return (
                            <SelectItem
                              key={availableRoom.id}
                              value={availableRoom.id}
                            >
                              Номер {availableRoom.number} -{" "}
                              {getRoomTypeText(availableRoom.type)} (Этаж{" "}
                              {availableRoom.floor}, Корпус{" "}
                              {availableRoom.building}) - {statusText}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTransferRoom}
                    disabled={!selectedNewRoom}
                  >
                    Перевести
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTransferRoom(false);
                      setSelectedNewRoom("");
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guest Management Actions */}
        {roomBookings.length > 1 && (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-4">
                {selectedGuestId
                  ? `Выбран гость: ${roomBookings.find((b) => b.id === selectedGuestId)?.guestName}`
                  : "Выберите гостя для выполнения действий"}
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    const selectedBooking =
                      roomBookings.find((b) => b.id === selectedGuestId) ||
                      effectiveBooking;
                    setEditedBooking({ ...selectedBooking });
                    setShowEditStay(true);
                  }}
                  disabled={!selectedGuestId && roomBookings.length > 1}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Изменить срок
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTransferRoom(true)}
                  disabled={!selectedGuestId && roomBookings.length > 1}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Перевести
                </Button>
                {(() => {
                  const selectedBooking =
                    roomBookings.find((b) => b.id === selectedGuestId) ||
                    effectiveBooking;
                  return (
                    selectedBooking?.status !== "checked_in" && (
                      <Button
                        variant="outline"
                        onClick={handleCheckIn}
                        disabled={!selectedGuestId && roomBookings.length > 1}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Заселить
                      </Button>
                    )
                  );
                })()}
                <Button
                  variant="outline"
                  onClick={handleCheckOut}
                  disabled={!selectedGuestId && roomBookings.length > 1}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выселить
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
          <div className="flex gap-3">
            {roomBookings.length === 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditedBooking({ ...effectiveBooking });
                    setShowEditStay(true);
                  }}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Изменить дату
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTransferRoom(true)}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Переселить
                </Button>
                {effectiveBooking?.status !== "checked_in" && (
                  <Button
                    variant="outline"
                    onClick={handleCancelBooking}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                )}
                {effectiveBooking?.status === "checked_in" && (
                  <Button
                    onClick={handleCheckOut}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выселить
                  </Button>
                )}
                {effectiveBooking?.status !== "checked_in" && (
                  <Button
                    onClick={handleCheckIn}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Заселить
                  </Button>
                )}
              </>
            )}
            {canAddGuest && (
              <Button
                variant="outline"
                onClick={handleAddGuestClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить гостя
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

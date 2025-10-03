import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, Booking, Guest, Organization } from "@/types/booking";
import { User, Plus, Save, Bed, Building } from "lucide-react";

interface BookingDialogProps {
  selectedRoomId?: string;
  room?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookRoom?: (bookingData: Omit<Booking, "id" | "createdAt">) => void;
  rooms?: Room[];
  guests?: Guest[];
  prefilledGuest?: Guest | null;
  organizations?: Organization[];
  selectedDate?: Date | null;
  bookings?: Booking[];
}

export default function BookingDialog({
  selectedRoomId: propSelectedRoomId,
  room = null,
  isOpen = false,
  onClose = () => {},
  onBookRoom = () => {},
  rooms = [],
  guests = [],
  prefilledGuest = null,
  organizations = [],
  selectedDate = null,
  bookings = [],
}: BookingDialogProps) {
  console.debug("[SAFE-FIX] BookingDialog rendered for new booking", {
    selectedRoomId: propSelectedRoomId,
    hasRoom: !!room,
  });

  const [selectedRoomId, setSelectedRoomId] = useState(
    propSelectedRoomId || room?.id || "",
  );

  // Main effect to handle form initialization for new bookings
  React.useEffect(() => {
    if (!isOpen) return;

    // Clear all form fields for new booking
    setGuestName("");
    setGuestPhone("");
    setGuestAge("");
    setGuestAddress("");
    setGuestGender("male");
    setGuestPassport("");
    setVoucherNumber("");
    setSelectedOrganizationId("none");

    // Reset dates to default or use selected date from calendar
    const defaultCheckInDate = selectedDate
      ? selectedDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    setCheckInDate(defaultCheckInDate);
    const tomorrow = new Date(selectedDate || new Date());
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckOutDate(tomorrow.toISOString().split("T")[0]);

    // Handle room selection - prioritize propSelectedRoomId
    if (propSelectedRoomId) {
      setSelectedRoomId(propSelectedRoomId);
      const selectedRoom = rooms.find((r) => r.id === propSelectedRoomId);
      setRoomSearchTerm(selectedRoom?.number || "");
    } else if (room?.id) {
      setSelectedRoomId(room.id);
      setRoomSearchTerm(room.number);
    } else {
      setSelectedRoomId("");
      setRoomSearchTerm("");
    }

    // Handle prefilled guest data
    if (prefilledGuest) {
      setGuestName(prefilledGuest.fullName);
      setGuestPhone(prefilledGuest.phone);
      setGuestAge(prefilledGuest.age.toString());
      setGuestAddress(prefilledGuest.address);
      setGuestGender(prefilledGuest.gender);
      setGuestPassport(prefilledGuest.passportNumber);
    }
  }, [room, prefilledGuest, isOpen, propSelectedRoomId, rooms, selectedDate]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAge, setGuestAge] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [guestGender, setGuestGender] = useState<"male" | "female">("male");
  const [guestPassport, setGuestPassport] = useState("");

  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("none");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");

  // Don't render if dialog is closed
  if (!isOpen) return null;

  const handleCreateBooking = () => {
    if (
      !selectedRoomId ||
      !guestName ||
      !guestPhone ||
      !guestAge ||
      !guestAddress
    ) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

    // Check if room is blocked
    if (selectedRoom?.blocked) {
      alert(
        `Номер ${selectedRoom.number} заблокирован. Бронирование невозможно.`,
      );
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const duration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (duration <= 0) {
      alert("Дата выезда должна быть позже даты заезда");
      return;
    }

    // Normalize dates for comparison
    const checkInDateOnly = new Date(checkIn);
    checkInDateOnly.setHours(0, 0, 0, 0);
    const checkOutDateOnly = new Date(checkOut);
    checkOutDateOnly.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if room has available capacity for the booking period
    if (selectedRoom) {
      // Count guests in this room during the booking period
      const overlappingGuests = bookings.filter((b) => {
        if (
          b.roomId !== selectedRoomId ||
          b.status === "cancelled" ||
          b.status === "completed"
        ) {
          return false;
        }
        const bCheckIn = new Date(b.checkInDate);
        bCheckIn.setHours(0, 0, 0, 0);
        const bCheckOut = new Date(b.checkOutDate);
        bCheckOut.setHours(0, 0, 0, 0);

        // Check if booking periods overlap
        return checkInDateOnly < bCheckOut && checkOutDateOnly > bCheckIn;
      });

      if (overlappingGuests.length >= selectedRoom.capacity) {
        alert(
          `Номер ${selectedRoom.number} полностью занят на выбранные даты (${overlappingGuests.length}/${selectedRoom.capacity}). Выберите другой номер или другие даты.`,
        );
        return;
      }
    }

    // Check if guest already exists by phone OR passport (if passport provided)
    const existingGuest = guests.find(
      (g) =>
        g.phone === guestPhone ||
        (guestPassport && g.passportNumber === guestPassport),
    );

    const guestId = existingGuest ? existingGuest.id : `guest-${Date.now()}`;

    // Determine booking status based on check-in date (reuse today variable from above)
    const bookingStatus = checkInDateOnly > today ? "confirmed" : "booked";

    // Create booking
    const bookingData: Omit<Booking, "id" | "createdAt"> = {
      roomId: selectedRoomId,
      guestId: guestId,
      guestName,
      guestPhone,
      guestAge: parseInt(guestAge) || 0,
      guestAddress,
      guestGender,
      guestPassport,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      duration,
      status: bookingStatus,
      services: [],
      voucherNumber: voucherNumber || undefined,
      organizationId:
        selectedOrganizationId !== "none" ? selectedOrganizationId : undefined,
    };

    onBookRoom(bookingData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Plus className="w-6 h-6" />
            Создать новое бронирование
          </DialogTitle>
        </DialogHeader>

        {/* New booking form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Selection */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  Выбор номера
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="room-search">Поиск номера *</Label>
                  <Input
                    id="room-search"
                    placeholder="Введите номер комнаты..."
                    value={roomSearchTerm}
                    onChange={(e) => setRoomSearchTerm(e.target.value)}
                  />
                  {(roomSearchTerm || !selectedRoomId) && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                      {rooms
                        .filter(
                          (r) =>
                            !r.blocked &&
                            (roomSearchTerm === "" ||
                              r.number
                                .toLowerCase()
                                .includes(roomSearchTerm.toLowerCase())),
                        )
                        .slice(0, 20)
                        .map((room) => (
                          <div
                            key={room.id}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                              selectedRoomId === room.id ? "bg-blue-100" : ""
                            }`}
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              setRoomSearchTerm(room.number);
                            }}
                          >
                            Номер {room.number} -{" "}
                            {room.type === "single"
                              ? "Одноместный"
                              : room.type === "double"
                                ? "Двухместный"
                                : room.type === "double_with_balcony"
                                  ? "С балконом"
                                  : "Люкс"}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin-date">Дата заезда *</Label>
                    <Input
                      id="checkin-date"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout-date">Дата выезда *</Label>
                    <Input
                      id="checkout-date"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="organization">Организация</Label>
                    <Select
                      value={selectedOrganizationId}
                      onValueChange={setSelectedOrganizationId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите организацию (необязательно)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Без организации</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {org.officialName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="voucher">Номер путевки</Label>
                    <Input
                      id="voucher"
                      value={voucherNumber}
                      onChange={(e) => setVoucherNumber(e.target.value)}
                      placeholder={
                        selectedOrganizationId !== "none"
                          ? "Введите номер путевки"
                          : "Сначала выберите организацию"
                      }
                      disabled={selectedOrganizationId === "none"}
                    />
                    {selectedOrganizationId !== "none" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Путевка будет привязана к выбранной организации
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Информация о госте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="guest-name">ФИО *</Label>
                  <Input
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Фамилия Имя Отчество"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest-phone">Телефон *</Label>
                    <Input
                      id="guest-phone"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+(373) 123-45-67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest-age">Возраст *</Label>
                    <Input
                      id="guest-age"
                      type="number"
                      value={guestAge}
                      onChange={(e) => setGuestAge(e.target.value)}
                      placeholder="25"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guest-address">Адрес *</Label>
                  <Textarea
                    id="guest-address"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    placeholder="Полный адрес проживания"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="guest-passport">Паспортные данные</Label>
                  <Input
                    id="guest-passport"
                    value={guestPassport}
                    onChange={(e) => setGuestPassport(e.target.value)}
                    placeholder="Серия и номер паспорта (необязательно)"
                  />
                </div>

                <div>
                  <Label htmlFor="guest-gender">Пол *</Label>
                  <Select
                    value={guestGender}
                    onValueChange={(value: "male" | "female") =>
                      setGuestGender(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="female">Женский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <div className="flex gap-3">
              <Button onClick={handleCreateBooking}>
                <Save className="w-4 h-4 mr-2" />
                Создать бронирование
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

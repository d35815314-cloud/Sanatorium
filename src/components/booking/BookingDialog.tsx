import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Room, Booking } from "@/types/booking";
import { CalendarIcon, User, Phone, MapPin, Clock } from "lucide-react";

interface BookingDialogProps {
  room?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookRoom: (booking: Omit<Booking, "id" | "createdAt">) => void;
}

export default function BookingDialog({
  room = null,
  isOpen = false,
  onClose = () => {},
  onBookRoom = () => {},
}: BookingDialogProps) {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAge, setGuestAge] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  const handleSubmit = () => {
    if (!room || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
      return;
    }

    const duration = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const booking: Omit<Booking, "id" | "createdAt"> = {
      roomId: room.id,
      guestName,
      guestPhone,
      guestAge: parseInt(guestAge) || 0,
      guestAddress,
      checkInDate,
      checkOutDate,
      duration,
      status: "active",
    };

    onBookRoom(booking);
    handleClose();
  };

  const handleClose = () => {
    setGuestName("");
    setGuestPhone("");
    setGuestAge("");
    setGuestAddress("");
    setCheckInDate(new Date());
    setCheckOutDate(undefined);
    setShowCheckInCalendar(false);
    setShowCheckOutCalendar(false);
    onClose();
  };

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
      default:
        return status;
    }
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Бронирование номера {room.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Информация о номере</h3>
              <Badge
                variant={room.status === "available" ? "default" : "secondary"}
              >
                {getStatusText(room.status)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Номер:</span> {room.number}
              </div>
              <div>
                <span className="font-medium">Этаж:</span> {room.floor}
              </div>
              <div>
                <span className="font-medium">Тип:</span>{" "}
                {getRoomTypeText(room.type)}
              </div>
              <div>
                <span className="font-medium">Позиция:</span>{" "}
                {room.position.row + 1}-{room.position.col + 1}
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Данные гостя
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ФИО</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Введите полное имя"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Телефон
                </label>
                <Input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Возраст
                </label>
                <Input
                  type="number"
                  value={guestAge}
                  onChange={(e) => setGuestAge(e.target.value)}
                  placeholder="Возраст"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Адрес
                </label>
                <Input
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  placeholder="Адрес проживания"
                />
              </div>
            </div>
          </div>

          {/* Booking Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Даты проживания
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Дата заселения
                </label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate
                      ? checkInDate.toLocaleDateString("ru-RU")
                      : "Выберите дату"}
                  </Button>
                  {showCheckInCalendar && (
                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={(date) => {
                          setCheckInDate(date);
                          setShowCheckInCalendar(false);
                        }}
                        disabled={(date) => date < new Date()}
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
                    className="w-full justify-start text-left font-normal"
                    onClick={() =>
                      setShowCheckOutCalendar(!showCheckOutCalendar)
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate
                      ? checkOutDate.toLocaleDateString("ru-RU")
                      : "Выберите дату"}
                  </Button>
                  {showCheckOutCalendar && (
                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={(date) => {
                          setCheckOutDate(date);
                          setShowCheckOutCalendar(false);
                        }}
                        disabled={(date) => !checkInDate || date <= checkInDate}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {checkInDate && checkOutDate && (
              <div className="text-sm text-gray-600">
                Срок проживания:{" "}
                {Math.ceil(
                  (checkOutDate.getTime() - checkInDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                дней
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !guestName ||
              !guestPhone ||
              !checkInDate ||
              !checkOutDate ||
              room.status !== "available"
            }
          >
            Забронировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

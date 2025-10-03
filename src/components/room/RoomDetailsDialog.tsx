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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, Booking, Service } from "@/types/booking";
import {
  User,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Bed,
  Wifi,
  Tv,
  Car,
  Coffee,
  Edit,
  Save,
  X,
  UserPlus,
  LogOut,
  ArrowRightLeft,
  CalendarPlus,
  Ticket,
  FileText,
} from "lucide-react";

interface RoomDetailsDialogProps {
  room?: Room | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBooking?: (booking: Booking) => void;
  onCheckOut?: (bookingId: string) => void;
  onTransferRoom?: (bookingId: string, newRoomId: string) => void;
  onExtendStay?: (bookingId: string, newCheckOutDate: Date) => void;

  onOpenGuestCard?: (guestId: string) => void;
}

const mockServices: Service[] = [
  { id: "1", name: "Массаж", price: 1500, category: "spa", duration: 60 },
  { id: "2", name: "Завтрак", price: 800, category: "dining" },
  { id: "3", name: "Трансфер", price: 500, category: "transport" },
  {
    id: "4",
    name: "Экскурсия",
    price: 2000,
    category: "entertainment",
    duration: 180,
  },
];

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case "wifi":
      return <Wifi className="w-4 h-4" />;
    case "tv":
      return <Tv className="w-4 h-4" />;
    case "parking":
      return <Car className="w-4 h-4" />;
    case "minibar":
      return <Coffee className="w-4 h-4" />;
    default:
      return <Bed className="w-4 h-4" />;
  }
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
    case "maintenance":
      return "Обслуживание";
    case "cleaning":
      return "Уборка";
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
    case "maintenance":
      return "bg-orange-100 text-orange-800";
    case "cleaning":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function RoomDetailsDialog({
  room = null,
  booking = null,
  isOpen = false,
  onClose = () => {},
  onUpdateBooking = () => {},
  onCheckOut = () => {},
  onTransferRoom = () => {},
  onExtendStay = () => {},

  onOpenGuestCard = () => {},
}: RoomDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  if (!room) return null;

  const defaultAmenities = ["WiFi", "TV", "Minibar", "Кондиционер"];
  const amenities = room.amenities || defaultAmenities;
  const orderedServices = booking?.services || mockServices.slice(0, 2);

  const handleEditStart = () => {
    if (booking) {
      setEditedBooking({ ...booking });
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
    if (booking) {
      onCheckOut(booking.id);
    }
  };

  const isCheckOutTime = booking && new Date() >= booking.checkOutDate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bed className="w-6 h-6" />
              Номер {room.number} - {getRoomTypeText(room.type)}
              <Badge className={getStatusColor(room.status)}>
                {getStatusText(room.status)}
              </Badge>
            </div>
            {booking && (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Информация о номере
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <span className="font-medium text-gray-600">
                    Вместимость:
                  </span>
                  <div className="font-semibold">{room.capacity || 2} чел.</div>
                </div>
              </div>

              <Separator />

              <div>
                <span className="font-medium text-gray-600 mb-2 block">
                  Удобства:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          {booking && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Информация о госте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">ФИО:</span>
                    <div className="font-semibold text-lg">
                      {booking.guestName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Телефон:
                      </span>
                      <div className="font-semibold">{booking.guestPhone}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Возраст:
                      </span>
                      <div className="font-semibold">
                        {booking.guestAge} лет
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Адрес:
                    </span>
                    <div className="font-semibold">{booking.guestAddress}</div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Заселение:
                      </span>
                      {isEditing && editedBooking ? (
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
                          {booking.checkInDate.toLocaleDateString("ru-RU")}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Выселение:
                      </span>
                      {isEditing && editedBooking ? (
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
                          {booking.checkOutDate.toLocaleDateString("ru-RU")}
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
                      {isEditing && editedBooking
                        ? editedBooking.duration
                        : booking.duration}{" "}
                      дней
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Пол:</span>
                    <div className="font-semibold">
                      {booking.guestGender === "male" ? "Мужской" : "Женский"}
                    </div>
                  </div>

                  {booking.voucherNumber && (
                    <div>
                      <span className="font-medium text-gray-600 flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        Номер путевки:
                      </span>
                      <div className="font-semibold">
                        {booking.voucherNumber}
                      </div>
                    </div>
                  )}

                  {booking.secondGuestName && (
                    <>
                      <Separator />
                      <div>
                        <span className="font-medium text-gray-600">
                          Второй гость:
                        </span>
                        <div className="font-semibold">
                          {booking.secondGuestName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.secondGuestGender === "male"
                            ? "Мужской"
                            : "Женский"}
                        </div>
                      </div>
                    </>
                  )}

                  {isCheckOutTime && (
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

                  {booking.isHalfDay && (
                    <div>
                      <Badge variant="outline" className="bg-blue-50">
                        Половина дня (
                        {booking.halfDayType === "morning" ? "утро" : "день"})
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ordered Services */}
        {orderedServices.length > 0 && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Заказанные услуги
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600">
                          {service.description}
                        </div>
                      )}
                      {service.duration && (
                        <div className="text-xs text-gray-500">
                          Продолжительность: {service.duration} мин
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                  </div>
                ))}

                <Separator />
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
          {booking && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => booking && onOpenGuestCard(booking.guestId)}
              >
                <User className="w-4 h-4 mr-2" />
                Карточка гостя
              </Button>
              {isCheckOutTime && (
                <Button variant="destructive" onClick={handleCheckOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Выселить
                </Button>
              )}
              <Button variant="outline">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Перевести
              </Button>
              <Button variant="outline">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Продлить
              </Button>
              <Button>Печать отчета</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

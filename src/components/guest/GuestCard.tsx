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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Guest, Booking } from "@/types/booking";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  History,
  Edit,
  UserCheck,
  Save,
  X,
} from "lucide-react";

interface GuestCardProps {
  guest?: Guest | null;
  bookings?: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (guest: Guest) => void;
  onNewBooking?: (guest: Guest) => void;
  onUpdateGuest?: (guest: Guest) => void;
  onOpenGuestCard?: (guestId: string) => void;
  guests?: Guest[];
}

export default function GuestCard({
  guest = null,
  bookings = [],
  isOpen = false,
  onClose = () => {},
  onEdit = () => {},
  onNewBooking = () => {},
  onUpdateGuest = () => {},
  onOpenGuestCard = () => {},
  guests = [],
}: GuestCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGuest, setEditedGuest] = useState<Guest | null>(null);

  if (!guest) return null;

  const activeBookings = bookings.filter(
    (b) => b.status === "active" || b.status === "checked_in",
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalStays = completedBookings.length;
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + (booking.totalAmount || 0),
    0,
  );

  const handleEditStart = () => {
    setEditedGuest({ ...guest });
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editedGuest) {
      const updatedGuest = {
        ...editedGuest,
        fullName:
          `${editedGuest.lastName} ${editedGuest.firstName} ${editedGuest.middleName || ""}`.trim(),
      };
      onUpdateGuest(updatedGuest);
      setIsEditing(false);
      setEditedGuest(null);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedGuest(null);
  };

  const currentGuest = isEditing ? editedGuest : guest;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" />
              Карточка гостя
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEditStart}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEditSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
                <Button variant="outline" size="sm" onClick={handleEditCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Личная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 ${
                    guest.gender === "male"
                      ? "bg-gradient-to-br from-blue-400 to-blue-600"
                      : "bg-gradient-to-br from-pink-400 to-pink-600"
                  }`}
                >
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">{currentGuest?.fullName}</h3>
                <p className="text-gray-600">
                  ID: {currentGuest?.id?.slice(0, 8) || "N/A"}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600">Имя:</span>
                    {isEditing ? (
                      <Input
                        value={editedGuest?.firstName || ""}
                        onChange={(e) =>
                          setEditedGuest((prev) =>
                            prev
                              ? { ...prev, firstName: e.target.value }
                              : null,
                          )
                        }
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">
                        {currentGuest?.firstName}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Фамилия:</span>
                    {isEditing ? (
                      <Input
                        value={editedGuest?.lastName || ""}
                        onChange={(e) =>
                          setEditedGuest((prev) =>
                            prev ? { ...prev, lastName: e.target.value } : null,
                          )
                        }
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">
                        {currentGuest?.lastName}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Отчество:</span>
                  {isEditing ? (
                    <Input
                      value={editedGuest?.middleName || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev ? { ...prev, middleName: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-semibold">
                      {currentGuest?.middleName || "-"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Дата рождения:
                    </span>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={
                          editedGuest?.dateOfBirth
                            ? editedGuest.dateOfBirth
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          const age =
                            new Date().getFullYear() - newDate.getFullYear();
                          setEditedGuest((prev) =>
                            prev
                              ? { ...prev, dateOfBirth: newDate, age }
                              : null,
                          );
                        }}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">
                        {currentGuest?.dateOfBirth
                          ? currentGuest.dateOfBirth.toLocaleDateString("ru-RU")
                          : "-"}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Возраст:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedGuest?.age || ""}
                        onChange={(e) => {
                          const age = parseInt(e.target.value);
                          const birthYear = new Date().getFullYear() - age;
                          const dateOfBirth = new Date(birthYear, 0, 1);
                          setEditedGuest((prev) =>
                            prev ? { ...prev, age, dateOfBirth } : null,
                          );
                        }}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">
                        {currentGuest?.age} лет
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Пол:</span>
                  {isEditing ? (
                    <Select
                      value={editedGuest?.gender || "male"}
                      onValueChange={(value: "male" | "female") =>
                        setEditedGuest((prev) =>
                          prev ? { ...prev, gender: value } : null,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мужской</SelectItem>
                        <SelectItem value="female">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="font-semibold">
                      {currentGuest?.gender === "male" ? "Мужской" : "Женский"}
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Паспорт:
                  </span>
                  {isEditing ? (
                    <Input
                      value={editedGuest?.passportNumber || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev
                            ? { ...prev, passportNumber: e.target.value }
                            : null,
                        )
                      }
                      className="mt-1"
                      placeholder="Необязательно"
                    />
                  ) : (
                    <div className="font-semibold">
                      {currentGuest?.passportNumber || "-"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Телефон:
                  </span>
                  {isEditing ? (
                    <Input
                      value={editedGuest?.phone || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev ? { ...prev, phone: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-semibold text-lg">
                      {currentGuest?.phone}
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email:
                  </span>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedGuest?.email || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev ? { ...prev, email: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-semibold">
                      {currentGuest?.email || "-"}
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Адрес:
                  </span>
                  {isEditing ? (
                    <Textarea
                      value={editedGuest?.address || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev ? { ...prev, address: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      rows={2}
                    />
                  ) : (
                    <div className="font-semibold">{currentGuest?.address}</div>
                  )}
                </div>

                <Separator />
                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Экстренный контакт:
                  </span>
                  {isEditing ? (
                    <Input
                      value={editedGuest?.emergencyContact || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev
                            ? { ...prev, emergencyContact: e.target.value }
                            : null,
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-semibold">
                      {currentGuest?.emergencyContact || "-"}
                    </div>
                  )}
                  {(currentGuest?.emergencyPhone || isEditing) && (
                    <div className="mt-2">
                      <span className="font-medium text-gray-600">
                        Телефон экстренного контакта:
                      </span>
                      {isEditing ? (
                        <Input
                          value={editedGuest?.emergencyPhone || ""}
                          onChange={(e) =>
                            setEditedGuest((prev) =>
                              prev
                                ? { ...prev, emergencyPhone: e.target.value }
                                : null,
                            )
                          }
                          className="mt-1"
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {currentGuest?.emergencyPhone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />
                <div>
                  <span className="font-medium text-gray-600">Заметки:</span>
                  {isEditing ? (
                    <Textarea
                      value={editedGuest?.notes || ""}
                      onChange={(e) =>
                        setEditedGuest((prev) =>
                          prev ? { ...prev, notes: e.target.value } : null,
                        )
                      }
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <div className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                      {currentGuest?.notes || "Нет заметок"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <History className="w-5 h-5" />
              Статистика проживания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalStays}
                </div>
                <div className="text-sm text-gray-600">Всего проживаний</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {activeBookings.length}
                </div>
                <div className="text-sm text-gray-600">Активных броней</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {guest.createdAt
                    ? guest.createdAt.toLocaleDateString("ru-RU")
                    : "-"}
                </div>
                <div className="text-sm text-gray-600">Первое посещение</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking History */}
        {bookings.length > 0 && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                История бронирований
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Номер {booking.roomId}
                        </span>
                        <Badge
                          variant={
                            booking.status === "active" ||
                            booking.status === "checked_in"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {booking.status === "active"
                            ? "Активно"
                            : booking.status === "checked_in"
                              ? "Заселен"
                              : booking.status === "completed"
                                ? "Завершено"
                                : booking.status === "cancelled"
                                  ? "Отменено"
                                  : booking.status}
                        </Badge>
                        {booking.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // For completed bookings, open the guest card for this specific booking's guest
                              const bookingGuest = guests?.find(
                                (g) => g.id === booking.guestId,
                              );
                              if (bookingGuest && onOpenGuestCard) {
                                onOpenGuestCard(booking.guestId);
                              }
                            }}
                            className="ml-2"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Карточка
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.checkInDate.toLocaleDateString("ru-RU")} -{" "}
                        {booking.checkOutDate.toLocaleDateString("ru-RU")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.duration} дней
                        {booking.voucherNumber && (
                          <span className="ml-2">
                            • Путевка: {booking.voucherNumber}
                          </span>
                        )}
                      </div>
                      {booking.secondGuestName && (
                        <div className="text-xs text-blue-600">
                          + {booking.secondGuestName}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {booking.createdAt.toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  </div>
                ))}
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
          <Button onClick={() => guest && onNewBooking(guest)}>
            <UserCheck className="w-4 h-4 mr-2" />
            Новое бронирование
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

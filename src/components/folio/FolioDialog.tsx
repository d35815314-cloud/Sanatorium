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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Folio, Service } from "@/types/booking";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Printer,
  CreditCard,
  LogIn,
} from "lucide-react";

interface FolioDialogProps {
  folio?: Folio | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFolio?: (folio: Folio) => void;
  onAddPayment?: (folioId: string, amount: number) => void;
  onCheckIn?: (bookingId: string) => void;
}

const mockServices: Service[] = [
  { id: "1", name: "Массаж", price: 0, category: "spa", duration: 60 },
  { id: "2", name: "Завтрак", price: 0, category: "dining" },
  { id: "3", name: "Трансфер", price: 0, category: "transport" },
  {
    id: "4",
    name: "Экскурсия",
    price: 0,
    category: "entertainment",
    duration: 180,
  },
  { id: "5", name: "Обед", price: 0, category: "dining" },
  { id: "6", name: "Ужин", price: 0, category: "dining" },
  { id: "7", name: "Сауна", price: 0, category: "spa", duration: 90 },
];

export default function FolioDialog({
  folio = null,
  isOpen = false,
  onClose = () => {},
  onUpdateFolio = () => {},
  onAddPayment = () => {},
  onCheckIn = () => {},
}: FolioDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFolio, setEditedFolio] = useState<Folio | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentInput, setShowPaymentInput] = useState(false);

  if (!folio) return null;

  const handleEditStart = () => {
    setEditedFolio({ ...folio });
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editedFolio) {
      onUpdateFolio(editedFolio);
      setIsEditing(false);
      setEditedFolio(null);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedFolio(null);
  };

  const handleAddService = (service: Service) => {
    if (editedFolio) {
      const newServices = [...editedFolio.services, service];
      const newServiceCharges = newServices.reduce(
        (sum, s) => sum + s.price,
        0,
      );
      const newTotalAmount = editedFolio.roomCharges + newServiceCharges;
      const newBalance = newTotalAmount - editedFolio.paidAmount;

      setEditedFolio({
        ...editedFolio,
        services: newServices,
        serviceCharges: newServiceCharges,
        totalAmount: newTotalAmount,
        balance: newBalance,
      });
    }
  };

  const handleRemoveService = (serviceId: string) => {
    if (editedFolio) {
      const newServices = editedFolio.services.filter(
        (s) => s.id !== serviceId,
      );
      const newServiceCharges = newServices.reduce(
        (sum, s) => sum + s.price,
        0,
      );
      const newTotalAmount = editedFolio.roomCharges + newServiceCharges;
      const newBalance = newTotalAmount - editedFolio.paidAmount;

      setEditedFolio({
        ...editedFolio,
        services: newServices,
        serviceCharges: newServiceCharges,
        totalAmount: newTotalAmount,
        balance: newBalance,
      });
    }
  };

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0 && amount <= folio.balance) {
      onAddPayment(folio.id, amount);
      setPaymentAmount("");
      setShowPaymentInput(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Фолио ${folio.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Фолио ${folio.id}</h1>
          <div class="header">
            <div>
              <strong>Гость:</strong> ${folio.guestName}<br>
              <strong>Номер:</strong> ${folio.roomNumber}<br>
              <strong>Заезд:</strong> ${folio.checkInDate.toLocaleDateString("ru-RU")}<br>
              <strong>Выезд:</strong> ${folio.checkOutDate.toLocaleDateString("ru-RU")}
            </div>
            <div>
              <strong>Дата создания:</strong> ${new Date().toLocaleDateString("ru-RU")}<br>
              <strong>Статус:</strong> ${folio.status === "paid" ? "Оплачено" : folio.status === "open" ? "Открыто" : "Закрыто"}
            </div>
          </div>
          
          <h3>Услуги:</h3>
          <table>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Категория</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Проживание</td>
                <td>Размещение</td>
                <td>Включено</td>
              </tr>
              ${folio.services
                .map(
                  (service) => `
                <tr>
                  <td>${service.name}</td>
                  <td>${service.category}</td>
                  <td>Включено</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="margin-top: 20px;">
            <div class="total">Статус: Все включено</div>
            <div>Оплата: Включена в путевку</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const currentFolio = isEditing ? editedFolio : folio;
  if (!currentFolio) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Фолио {currentFolio.id}
              <Badge
                variant={
                  currentFolio.status === "paid"
                    ? "default"
                    : currentFolio.status === "open"
                      ? "secondary"
                      : "outline"
                }
              >
                {currentFolio.status === "paid"
                  ? "Оплачено"
                  : currentFolio.status === "open"
                    ? "Открыто"
                    : "Закрыто"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEditStart}>
                  Редактировать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCancel}
                  >
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Guest and Room Information */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Информация о госте и номере
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Гость:</span>
                  <div className="font-semibold">{currentFolio.guestName}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Номер:</span>
                  <div className="font-semibold">{currentFolio.roomNumber}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Заезд:
                  </span>
                  <div className="font-semibold">
                    {currentFolio.checkInDate.toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Выезд:
                  </span>
                  <div className="font-semibold">
                    {currentFolio.checkOutDate.toLocaleDateString("ru-RU")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Статус проживания
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Проживание:</span>
                  <span className="font-semibold text-green-600">Включено</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Услуги:</span>
                  <span className="font-semibold text-green-600">
                    {currentFolio.services.length} услуг
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Статус:</span>
                  <span>Все включено</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Услуги
              </div>
              {isEditing && (
                <div className="text-sm text-gray-600">
                  Нажмите на услугу чтобы добавить
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Room Charges */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">Проживание</div>
                  <div className="text-sm text-gray-600">
                    Размещение в номере
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">Включено</div>
                  <Badge variant="outline" className="text-xs">
                    Размещение
                  </Badge>
                </div>
              </div>

              {/* Ordered Services */}
              {currentFolio.services.map((service) => (
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
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="font-bold text-green-600">Включено</div>
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Available Services (when editing) */}
              {isEditing && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Доступные услуги:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockServices
                      .filter(
                        (service) =>
                          !currentFolio.services.some(
                            (s) => s.id === service.id,
                          ),
                      )
                      .map((service) => (
                        <Button
                          key={service.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddService(service)}
                          className="justify-between"
                        >
                          <span>{service.name}</span>
                          <span>Включено</span>
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            {currentFolio.status === "open" && (
              <Button
                onClick={() => onCheckIn(currentFolio.bookingId)}
                className="bg-green-600 hover:bg-green-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Заселить
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Печать
            </Button>
            {currentFolio.status === "open" && (
              <Button
                onClick={() => {
                  const updatedFolio = {
                    ...currentFolio,
                    status: "paid" as const,
                  };
                  onUpdateFolio(updatedFolio);
                }}
              >
                Закрыть фолио
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

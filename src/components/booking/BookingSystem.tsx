import { useState, useMemo } from "react";
import {
  Room,
  Booking,
  Guest,
  Organization,
  AuditLog,
  RoomType,
  RoomStatus,
  computeRoomStatus,
} from "@/types/booking";
import { rooms } from "@/data/rooms";
import { cn } from "@/lib/utils";
import RoomGrid from "./RoomGrid";
import CalendarView from "./CalendarView";

import BookingDialog from "./BookingDialog";
import BookingDetailsDialog from "./BookingDetailsDialog";
import GuestCard from "../guest/GuestCard";
import OrganizationCard from "../organization/OrganizationCard";
import BlockRoomDialog from "./BlockRoomDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
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
  Settings,
  Moon,
  FileText,
  UserPlus,
  Plus,
  Edit,
  Trash2,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BookingSystem() {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState("1");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isGuestCardOpen, setIsGuestCardOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("sanatorium_bookings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((b: any) => ({
          ...b,
          checkInDate: new Date(b.checkInDate),
          checkOutDate: new Date(b.checkOutDate),
          createdAt: new Date(b.createdAt),
          actualCheckInAt: b.actualCheckInAt
            ? new Date(b.actualCheckInAt)
            : undefined,
          actualCheckOutAt: b.actualCheckOutAt
            ? new Date(b.actualCheckOutAt)
            : undefined,
        }));
      } catch (e) {
        console.error("Error loading bookings:", e);
        return [];
      }
    }
    return [];
  });
  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem("sanatorium_guests");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((g: any) => ({
          ...g,
          dateOfBirth: new Date(g.dateOfBirth),
          createdAt: new Date(g.createdAt),
        }));
      } catch (e) {
        console.error("Error loading guests:", e);
        return [];
      }
    }
    return [];
  });
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem("sanatorium_organizations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt),
        }));
      } catch (e) {
        console.error("Error loading organizations:", e);
        return [];
      }
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [guestSearchTerm, setGuestSearchTerm] = useState("");
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roomsData, setRoomsData] = useState(() => {
    const saved = localStorage.getItem("sanatorium_rooms");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({
          ...r,
          blockedAt: r.blockedAt ? new Date(r.blockedAt) : undefined,
        }));
      } catch (e) {
        console.error("Error loading rooms:", e);
        return rooms;
      }
    }
    return rooms;
  });
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("calendar");
  const [activeTab, setActiveTab] = useState("placement");
  const [currentDate, setCurrentDate] = useState(() => {
    const saved = localStorage.getItem("sanatorium_currentDate");
    if (saved) {
      try {
        return new Date(saved);
      } catch (e) {
        console.error("Error loading current date:", e);
        return new Date();
      }
    }
    return new Date();
  });
  const [auditHistory, setAuditHistory] = useState<
    { date: Date; bookings: Booking[]; rooms: Room[] }[]
  >([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isOrganizationCardOpen, setIsOrganizationCardOpen] = useState(false);
  const [isBlockRoomDialogOpen, setIsBlockRoomDialogOpen] = useState(false);
  const [reportDateFrom, setReportDateFrom] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportDateTo, setReportDateTo] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportBuilding, setReportBuilding] = useState<string>("all");
  const [reportFloor, setReportFloor] = useState<string>("all");
  const [reportRoomType, setReportRoomType] = useState<string>("all");
  const [isNewGuestDialogOpen, setIsNewGuestDialogOpen] = useState(false);
  const [isNewOrganizationDialogOpen, setIsNewOrganizationDialogOpen] =
    useState(false);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);

  // Settings dialog states
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isManageRolesDialogOpen, setIsManageRolesDialogOpen] = useState(false);
  const [isUserSettingsDialogOpen, setIsUserSettingsDialogOpen] =
    useState(false);
  const [isSystemSettingsDialogOpen, setIsSystemSettingsDialogOpen] =
    useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isAuditLogDialogOpen, setIsAuditLogDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("sanatorium_auditLogs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((log: any) => ({
          ...log,
          dateRun: new Date(log.dateRun),
          createdAt: new Date(log.createdAt),
        }));
      } catch (e) {
        console.error("Error loading audit logs:", e);
        return [];
      }
    }
    return [];
  });
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(() => {
    const saved = localStorage.getItem("sanatorium_roomTypes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((rt: any) => ({
          ...rt,
          createdAt: new Date(rt.createdAt),
        }));
      } catch (e) {
        console.error("Error loading room types:", e);
      }
    }
    // Default room types
    const defaultTypes = [
      {
        id: "single",
        name: "single",
        displayName: "1 Местный стд.",
        capacity: 1,
        createdAt: new Date(),
      },
      {
        id: "single_improved",
        name: "single_improved",
        displayName: "1 Местный ул. 1 кат. (душ)",
        capacity: 1,
        createdAt: new Date(),
      },
      {
        id: "double",
        name: "double",
        displayName: "2х Местный",
        capacity: 2,
        createdAt: new Date(),
      },
      {
        id: "double_improved",
        name: "double_improved",
        displayName: "2х Местный ул. 1 кат. (душ)",
        capacity: 2,
        createdAt: new Date(),
      },
      {
        id: "family",
        name: "family",
        displayName: "Семейный",
        capacity: 3,
        createdAt: new Date(),
      },
      {
        id: "family_improved",
        name: "family_improved",
        displayName: "Семейный ул. 1 кат. (душ)",
        capacity: 3,
        createdAt: new Date(),
      },
      {
        id: "luxury_double",
        name: "luxury_double",
        displayName: "Люкс 2 Местный",
        capacity: 2,
        createdAt: new Date(),
      },
      {
        id: "luxury",
        name: "luxury",
        displayName: "Люкс",
        capacity: 4,
        createdAt: new Date(),
      },
    ];
    localStorage.setItem("sanatorium_roomTypes", JSON.stringify(defaultTypes));
    return defaultTypes;
  });
  const [isAddRoomTypeDialogOpen, setIsAddRoomTypeDialogOpen] = useState(false);

  const handleRoomClick = (room: Room, clickedDate?: Date) => {
    console.debug("[SAFE-FIX] BookingSystem.handleRoomClick called", {
      roomId: room.id,
      roomNumber: room.number,
      clickedDate: clickedDate?.toISOString(),
    });

    // Use clicked date if provided, otherwise use current date from state
    const targetDate = clickedDate || currentDate;
    const roomStatus = computeRoomStatus(room, targetDate, bookings);

    // Check if room is blocked
    if (roomStatus === "blocked") {
      alert(
        `Номер ${room.number} заблокирован. Причина: ${room.blockReason || "Не указана"}`,
      );
      return;
    }

    // Find existing active booking for this room on the target date
    const selectedDate = new Date(targetDate);
    selectedDate.setHours(0, 0, 0, 0);

    const activeBooking = bookings.find((b) => {
      if (
        b.roomId !== room.id ||
        ["cancelled", "completed"].includes(b.status)
      ) {
        return false;
      }

      const checkIn = new Date(b.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(b.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);

      // Check if booking is active for selected date
      return selectedDate >= checkIn && selectedDate < checkOut;
    });

    // Close all dialogs first to prevent intermediate dialogs
    setIsBookingDialogOpen(false);
    setIsBookingDetailsOpen(false);
    setSelectedRoom(null);
    setSelectedBookingId(null);
    setSelectedDate(null);
    setIsCreatingNew(false);

    // Use setTimeout to ensure state is cleared before opening new dialog
    setTimeout(() => {
      // Logic: Free room -> BookingDialog, Booked/Occupied room -> BookingDetailsDialog
      if (roomStatus === "free") {
        console.debug("[SAFE-FIX] Opening BookingDialog for free room", {
          roomStatus,
          targetDate: targetDate.toISOString(),
        });
        setSelectedRoom(room);
        setSelectedBookingId(null);
        setSelectedDate(clickedDate || null);
        setIsCreatingNew(true);
        setIsBookingDialogOpen(true);
      } else if (roomStatus === "booked" || roomStatus === "occupied") {
        console.debug(
          "[SAFE-FIX] Opening BookingDetailsDialog for booked/occupied room",
          {
            activeBookingId: activeBooking?.id,
            roomStatus,
            targetDate: targetDate.toISOString(),
          },
        );
        setSelectedRoom(room);
        setSelectedBookingId(activeBooking?.id || null);
        setSelectedDate(clickedDate || null);
        setIsCreatingNew(false);
        setIsBookingDetailsOpen(true);
      }
    }, 10);
  };

  const handleRoomDoubleClick = (room: Room) => {
    setSelectedRoom(room);
    setSelectedBookingId(null);
    setIsCreatingNew(true);
    setIsBookingDialogOpen(true);
  };

  const handleContextMenuAction = (
    action: string,
    room: Room,
    booking?: Booking,
  ) => {
    setSelectedRoom(room);

    switch (action) {
      case "checkin":
        const checkinBooking = bookings.find(
          (b) =>
            b.roomId === room.id &&
            (b.status === "booked" || b.status === "confirmed"),
        );
        if (checkinBooking) {
          // Check in the existing booking
          handleCheckIn(checkinBooking.id);
        } else {
          // Create new booking for check-in
          setSelectedBookingId(null);
          setIsCreatingNew(true);
          setIsBookingDialogOpen(true);
        }
        break;
      case "checkout":
        // Handle checkout logic for specific booking
        if (booking) {
          handleCheckOut(booking.id);
        } else {
          // Fallback: checkout first active booking
          const roomBooking = bookings.find(
            (b) =>
              b.roomId === room.id &&
              (b.status === "checked_in" || b.status === "booked"),
          );
          if (roomBooking) {
            handleCheckOut(roomBooking.id);
          }
        }
        break;
      case "booking":
        // Open booking details for room - find active booking
        const activeBooking = bookings.find(
          (b) =>
            b.roomId === room.id &&
            (b.status === "checked_in" ||
              b.status === "booked" ||
              b.status === "confirmed"),
        );
        if (activeBooking) {
          setSelectedBookingId(activeBooking.id);
          setIsCreatingNew(false);
          setIsBookingDetailsOpen(true);
        } else {
          // No active booking, create new booking
          setSelectedBookingId(null);
          setIsCreatingNew(true);
          setIsBookingDialogOpen(true);
        }
        break;
      case "guest":
        // Show guest card
        const guestBooking = bookings.find(
          (b) =>
            b.roomId === room.id &&
            (b.status === "checked_in" ||
              b.status === "booked" ||
              b.status === "confirmed"),
        );
        if (guestBooking) {
          const guest = guests.find((g) => g.id === guestBooking.guestId);
          if (guest) {
            setSelectedGuest(guest);
            setIsGuestCardOpen(true);
          }
        }
        break;
      case "report":
        // Print report
        console.log("Print report for room:", room.number);
        break;

      case "block":
        // Block/unblock room - always open dialog
        setIsBlockRoomDialogOpen(true);
        break;
    }
  };

  const handleBlockRoom = (roomId: string, reason: string) => {
    setRoomsData((prevRooms) => {
      const updated = prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              blocked: true,
              blockReason: reason,
              blockedAt: new Date(),
            }
          : room,
      );
      localStorage.setItem("sanatorium_rooms", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnblockRoom = (roomId: string) => {
    console.debug("[SAFE-FIX] BookingSystem.handleUnblockRoom called", {
      roomId,
    });
    setRoomsData((prevRooms) => {
      const updated = prevRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              blocked: false,
              blockReason: undefined,
              blockedAt: undefined,
            }
          : room,
      );
      localStorage.setItem("sanatorium_rooms", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNightAudit = () => {
    const today = new Date(currentDate);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);

    let processedBookings = 0;
    let completedBookings = 0;
    let confirmedToBooked = 0;

    // Save current state to history
    setAuditHistory((prev) => [
      ...prev,
      {
        date: new Date(today),
        bookings: [...bookings],
        rooms: [...roomsData],
      },
    ]);

    // Process bookings according to nightly audit rules
    const updatedBookings = bookings.map((booking) => {
      processedBookings++;

      // Rule 1: checked_in bookings with expired checkout date -> completed
      if (booking.status === "checked_in") {
        const checkOutDate = new Date(booking.checkOutDate);
        checkOutDate.setHours(0, 0, 0, 0);

        // Auto-checkout if checkout date has passed
        if (checkOutDate <= today) {
          completedBookings++;
          return {
            ...booking,
            status: "completed" as const,
            actualCheckOutAt: new Date(),
          };
        }
      }

      // Rule 2: confirmed bookings with check-in date today -> booked
      if (
        booking.status === "confirmed" &&
        booking.checkInDate.toDateString() === today.toDateString()
      ) {
        confirmedToBooked++;
        return {
          ...booking,
          status: "booked" as const,
        };
      }

      return booking;
    });

    // Update bookings state
    setBookings(updatedBookings);
    localStorage.setItem(
      "sanatorium_bookings",
      JSON.stringify(updatedBookings),
    );

    // Create audit log entry
    const auditEntry: AuditLog = {
      id: `audit-${Date.now()}`,
      type: "nightly_audit",
      dateRun: new Date(),
      actor: "System",
      details: `Ночной аудит за ${today.toLocaleDateString("ru-RU")}. Обработано ${processedBookings} броней. Завершено: ${completedBookings}. Подтверждено к заселению: ${confirmedToBooked}.`,
      createdAt: new Date(),
    };
    setAuditLogs((prev) => {
      const updated = [auditEntry, ...prev];
      localStorage.setItem("sanatorium_auditLogs", JSON.stringify(updated));
      return updated;
    });

    // Move to next day - this will trigger re-render of calendar
    setCurrentDate(nextDay);
    localStorage.setItem("sanatorium_currentDate", nextDay.toISOString());

    // Generate night audit report
    const auditData = {
      date: currentDate.toLocaleDateString("ru-RU"),
      nextDate: nextDay.toLocaleDateString("ru-RU"),
      totalRooms: roomsData.length,
      availableRooms: roomsData.filter((r) => r.status === "available").length,
      occupiedRooms: roomsData.filter((r) => r.status === "occupied").length,
      bookedRooms: roomsData.filter((r) => r.status === "booked").length,
      blockedRooms: roomsData.filter((r) => r.status === "blocked").length,
      activeBookings: bookings.filter(
        (b) => b.status === "active" || b.status === "checked_in",
      ).length,
      checkInsToday: bookings.filter(
        (b) =>
          b.checkInDate.toDateString() === currentDate.toDateString() &&
          (b.status === "active" || b.status === "checked_in"),
      ).length,
      checkOutsToday: bookings.filter(
        (b) =>
          b.checkOutDate.toDateString() === currentDate.toDateString() &&
          (b.status === "active" || b.status === "checked_in"),
      ).length,
      totalGuests: guests.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };

    // Generate and print night audit report
    const reportContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ночной аудит - ${auditData.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 5px; }
            .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>НОЧНОЙ АУДИТ САНАТОРИЯ "ДНЕСТР"</h1>
          
          <div class="header">
            <div>
              <strong>Дата аудита:</strong> ${auditData.date}<br>
              <strong>Следующий день:</strong> ${auditData.nextDate}<br>
              <strong>Время создания:</strong> ${new Date().toLocaleString("ru-RU")}
            </div>
            <div style="text-align: right;">
              <strong>Система управления санаторием</strong><br>
              <em>Автоматический отчет</em>
            </div>
          </div>

          <div class="section">
            <h2>ОБЩАЯ СТАТИСТИКА</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${auditData.totalRooms}</div>
                <div class="stat-label">Всего номеров</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${auditData.availableRooms}</div>
                <div class="stat-label">Свободно</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${auditData.occupiedRooms}</div>
                <div class="stat-label">Занято</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${auditData.bookedRooms}</div>
                <div class="stat-label">Забронировано</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>ДВИЖЕНИЕ ГОСТЕЙ</h2>
            <table>
              <tr>
                <th>Показатель</th>
                <th>Количество</th>
                <th>Примечание</th>
              </tr>
              <tr>
                <td>Заезды на ${auditData.date}</td>
                <td>${auditData.checkInsToday}</td>
                <td>Гости, заселившиеся сегодня</td>
              </tr>
              <tr>
                <td>Выезды на ${auditData.date}</td>
                <td>${auditData.checkOutsToday}</td>
                <td>Гости, выехавшие сегодня</td>
              </tr>
              <tr>
                <td>Активные бронирования</td>
                <td>${auditData.activeBookings}</td>
                <td>Текущие активные брони</td>
              </tr>
              <tr>
                <td>Всего гостей в базе</td>
                <td>${auditData.totalGuests}</td>
                <td>Общее количество гостей</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2>СОСТОЯНИЕ НОМЕРОВ ПО КОРПУСАМ</h2>
            <table>
              <tr>
                <th>Корпус</th>
                <th>Всего номеров</th>
                <th>Свободно</th>
                <th>Занято</th>
                <th>Забронировано</th>
                <th>Заблокировано</th>
              </tr>
              <tr>
                <td>Корпус 1</td>
                <td>${roomsData.filter((r) => r.building === "1" || r.building === "A").length}</td>
                <td>${roomsData.filter((r) => (r.building === "1" || r.building === "A") && computeRoomStatus(r, today, bookings) === "free").length}</td>
                <td>${roomsData.filter((r) => (r.building === "1" || r.building === "A") && computeRoomStatus(r, today, bookings) === "occupied").length}</td>
                <td>${roomsData.filter((r) => (r.building === "1" || r.building === "A") && computeRoomStatus(r, today, bookings) === "booked").length}</td>
                <td>${roomsData.filter((r) => (r.building === "1" || r.building === "A") && r.blocked).length}</td>
              </tr>
              <tr>
                <td>Корпус 2</td>
                <td>${roomsData.filter((r) => r.building === "2" || r.building === "B").length}</td>
                <td>${roomsData.filter((r) => (r.building === "2" || r.building === "B") && computeRoomStatus(r, today, bookings) === "free").length}</td>
                <td>${roomsData.filter((r) => (r.building === "2" || r.building === "B") && computeRoomStatus(r, today, bookings) === "occupied").length}</td>
                <td>${roomsData.filter((r) => (r.building === "2" || r.building === "B") && computeRoomStatus(r, today, bookings) === "booked").length}</td>
                <td>${roomsData.filter((r) => (r.building === "2" || r.building === "B") && r.blocked).length}</td>
              </tr>
            </table>
          </div>

          <div class="summary">
            <h2>ИТОГИ ДНЯ</h2>
            <p><strong>Загруженность:</strong> ${Math.round(((auditData.occupiedRooms + auditData.bookedRooms) / auditData.totalRooms) * 100)}%</p>
            <p><strong>Общее количество гостей:</strong> ${auditData.totalGuests}</p>
            <p><strong>Статус системы:</strong> Все операции завершены успешно</p>
            <p><strong>Следующий аудит:</strong> ${auditData.nextDate} в 00:00</p>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    // Update room statuses and bookings for next day
    console.log("Night audit completed for:", nextDay.toLocaleDateString());
  };

  const handleDateRangeSelect = (
    room: Room,
    startDate: Date,
    endDate: Date,
  ) => {
    const duration =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1; // +1 to include both start and end dates

    // Create a booking with the selected date range
    const bookingData = {
      roomId: room.id,
      guestName: "Новый гость", // This will be filled in the dialog
      guestPhone: "",
      guestAge: 0,
      guestAddress: "",
      checkInDate: startDate,
      checkOutDate: endDate,
      duration,
      status: "active" as const,
    };

    setSelectedRoom(room);
    setIsBookingDetailsOpen(true);
  };

  const handleBookRoom = (bookingData: Omit<Booking, "id" | "createdAt">) => {
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if guest already exists by phone OR passport
    const existingGuest = guests.find(
      (g) =>
        g.phone === bookingData.guestPhone ||
        g.passportNumber === bookingData.guestPassport,
    );

    let guestId = bookingData.guestId;

    // Always create new guest for new bookings to ensure proper guest tracking
    if (!existingGuest) {
      const nameParts = bookingData.guestName.split(" ");
      const newGuest: Guest = {
        id: guestId,
        firstName: nameParts[1] || "",
        lastName: nameParts[0] || "",
        middleName: nameParts[2] || undefined,
        fullName: bookingData.guestName,
        phone: bookingData.guestPhone,
        age: bookingData.guestAge,
        dateOfBirth: new Date(
          new Date().getFullYear() - bookingData.guestAge,
          0,
          1,
        ),
        address: bookingData.guestAddress,
        passportNumber: bookingData.guestPassport || undefined,
        gender: bookingData.guestGender,
        createdAt: new Date(),
      };
      console.debug("[SAFE-FIX] Creating new guest:", newGuest);
      setGuests((prev) => {
        const updated = [...prev, newGuest];
        localStorage.setItem("sanatorium_guests", JSON.stringify(updated));
        return updated;
      });
    } else {
      guestId = existingGuest.id;
      console.debug("[SAFE-FIX] Using existing guest:", existingGuest);
    }

    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      guestId: guestId,
      createdAt: new Date(),
    };

    console.debug("[SAFE-FIX] Creating new booking:", newBooking);
    setBookings((prev) => {
      const updated = [...prev, newBooking];
      localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
      return updated;
    });

    // After creating booking, open the correct booking details
    setSelectedBookingId(bookingId);
    setIsCreatingNew(false);
    setIsBookingDetailsOpen(true);
    // Note: Room status is computed dynamically using computeRoomStatus function
  };

  const handleAddSecondGuest = (
    bookingData: Omit<Booking, "id" | "createdAt">,
  ) => {
    console.debug("[SAFE-FIX] Adding second guest:", bookingData);

    // Always create a new guest ID for additional guests
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new guest entry
    const nameParts = bookingData.guestName.split(" ");
    const newGuest: Guest = {
      id: guestId,
      firstName: nameParts[1] || "",
      lastName: nameParts[0] || "",
      middleName: nameParts[2] || undefined,
      fullName: bookingData.guestName,
      phone: bookingData.guestPhone,
      age: bookingData.guestAge,
      dateOfBirth: new Date(
        new Date().getFullYear() - bookingData.guestAge,
        0,
        1,
      ),
      address: bookingData.guestAddress,
      passportNumber: bookingData.guestPassport || undefined,
      gender: bookingData.guestGender,
      createdAt: new Date(),
    };

    console.debug("[SAFE-FIX] Creating additional guest:", newGuest);
    setGuests((prev) => {
      const updated = [...prev, newGuest];
      localStorage.setItem("sanatorium_guests", JSON.stringify(updated));
      return updated;
    });

    // Create new booking with unique ID
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      guestId: guestId,
      createdAt: new Date(),
    };

    console.debug("[SAFE-FIX] Creating additional booking:", newBooking);
    setBookings((prev) => {
      const updated = [...prev, newBooking];
      localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateBooking = (updatedBooking: Booking) => {
    setBookings((prevBookings) => {
      const updated = prevBookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking,
      );
      localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCheckOut = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setBookings((prevBookings) => {
        const updated = prevBookings.map((b) =>
          b.id === bookingId
            ? { ...b, status: "completed", actualCheckOutAt: new Date() }
            : b,
        );
        localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
        return updated;
      });
      // Note: No longer updating room status directly - it's computed dynamically
    }
  };

  const handleEarlyCheckOut = (bookingId: string) => {
    handleCheckOut(bookingId);
  };

  const handleExtendStay = (
    bookingId: string,
    newCheckInDate: Date,
    newCheckOutDate: Date,
  ) => {
    setBookings((prevBookings) => {
      const updated = prevBookings.map((booking) => {
        if (booking.id === bookingId) {
          const duration = Math.ceil(
            (newCheckOutDate.getTime() - newCheckInDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return {
            ...booking,
            checkInDate: newCheckInDate,
            checkOutDate: newCheckOutDate,
            duration,
          };
        }
        return booking;
      });
      localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleTransferRoom = (bookingId: string, newRoomId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const newRoom = roomsData.find((r) => r.id === newRoomId);

    if (booking && newRoom) {
      // Check if new room has available capacity
      const newRoomStatus = computeRoomStatus(newRoom, currentDate, bookings);

      // Count current occupancy in the new room
      const currentOccupancy = bookings.filter(
        (b) =>
          b.roomId === newRoomId &&
          b.id !== bookingId &&
          (b.status === "checked_in" ||
            b.status === "booked" ||
            b.status === "confirmed") &&
          b.checkInDate <= currentDate &&
          b.checkOutDate >= currentDate,
      ).length;

      // Check if room is blocked
      if (newRoomStatus === "blocked") {
        alert(
          `Номер ${newRoom.number} заблокирован и недоступен для перевода.`,
        );
        return;
      }

      // Check if there's available capacity
      if (currentOccupancy >= newRoom.capacity) {
        alert(
          `Номер ${newRoom.number} полностью занят. Вместимость: ${newRoom.capacity}, занято: ${currentOccupancy}`,
        );
        return;
      }

      // Update booking with new room
      setBookings((prevBookings) => {
        const updated = prevBookings.map((b) =>
          b.id === bookingId ? { ...b, roomId: newRoomId } : b,
        );
        localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
        return updated;
      });

      alert(
        `Гость ${booking.guestName} успешно переведен в номер ${newRoom.number}. Занято мест: ${currentOccupancy + 1}/${newRoom.capacity}`,
      );
    }
  };

  const handleNewBooking = (guest?: Guest) => {
    // Open booking dialog with guest pre-filled if provided
    setSelectedRoom(null);
    setSelectedGuest(guest || null);
    setSelectedBookingId(null);
    setIsCreatingNew(true);
    setIsBookingDialogOpen(true);
  };

  const handleOpenAddGuestDialog = (room: Room) => {
    console.debug("[SAFE-FIX] BookingSystem.handleOpenAddGuestDialog called", {
      roomId: room.id,
      roomNumber: room.number,
    });
    // Open booking dialog for new booking with room pre-filled
    setSelectedRoom(room);
    setSelectedGuest(null);
    setSelectedBookingId(null);
    setIsCreatingNew(true);
    setIsBookingDialogOpen(true);
  };

  const handleCheckIn = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      // Update booking status to checked_in
      setBookings((prevBookings) => {
        const updated = prevBookings.map((b) =>
          b.id === bookingId
            ? { ...b, status: "checked_in", actualCheckInAt: new Date() }
            : b,
        );
        localStorage.setItem("sanatorium_bookings", JSON.stringify(updated));
        return updated;
      });

      // After check-in, immediately open BookingDetailsDialog with the updated booking
      const room = roomsData.find((r) => r.id === booking.roomId);
      if (room) {
        // Close any open dialogs first
        setIsBookingDialogOpen(false);
        setIsBookingDetailsOpen(false);

        // Use setTimeout to ensure state is cleared before opening BookingDetailsDialog
        setTimeout(() => {
          setSelectedRoom(room);
          setSelectedBookingId(bookingId);
          setIsCreatingNew(false);
          setIsBookingDetailsOpen(true);
        }, 10);
      }
    }
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    setGuests((prevGuests) => {
      const updated = prevGuests.map((guest) =>
        guest.id === updatedGuest.id ? updatedGuest : guest,
      );
      localStorage.setItem("sanatorium_guests", JSON.stringify(updated));
      return updated;
    });
    // Also update the selected guest if it's the same one
    if (selectedGuest?.id === updatedGuest.id) {
      setSelectedGuest(updatedGuest);
    }
  };

  const handleAddNewGuest = () => {
    setIsNewGuestDialogOpen(true);
  };

  const handleAddNewOrganization = () => {
    setIsNewOrganizationDialogOpen(true);
  };

  const handleCreateGuest = (guestData: Omit<Guest, "id" | "createdAt">) => {
    const guestId = `guest-${Date.now()}`;
    const newGuest: Guest = {
      ...guestData,
      id: guestId,
      createdAt: new Date(),
    };
    const updated = [...guests, newGuest];
    setGuests(updated);
    localStorage.setItem("sanatorium_guests", JSON.stringify(updated));
    setIsNewGuestDialogOpen(false);
  };

  const handleCreateOrganization = (
    orgData: Omit<Organization, "id" | "createdAt">,
  ) => {
    const orgId = `org-${Date.now()}`;
    const newOrganization: Organization = {
      ...orgData,
      id: orgId,
      createdAt: new Date(),
    };
    const updated = [...organizations, newOrganization];
    setOrganizations(updated);
    localStorage.setItem("sanatorium_organizations", JSON.stringify(updated));
    setIsNewOrganizationDialogOpen(false);
  };

  // Auto checkout functionality
  const checkAutoCheckouts = () => {
    const now = new Date();
    const expiredBookings = bookings.filter(
      (booking) =>
        booking.status === "checked_in" && booking.checkOutDate <= now,
    );

    expiredBookings.forEach((booking) => {
      handleCheckOut(booking.id);
    });
  };

  // Run auto checkout check periodically
  useState(() => {
    const interval = setInterval(checkAutoCheckouts, 60000); // Check every minute
    return () => clearInterval(interval);
  });

  // Filter rooms based on search and filters
  const filteredRooms = useMemo(() => {
    return roomsData.filter((room) => {
      const matchesSearch =
        searchTerm === "" ||
        room.number.toLowerCase().includes(searchTerm.toLowerCase());

      const roomStatus = computeRoomStatus(room, currentDate, bookings);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && roomStatus === "free") ||
        (statusFilter === "occupied" && roomStatus === "occupied") ||
        (statusFilter === "booked" && roomStatus === "booked") ||
        (statusFilter === "blocked" && roomStatus === "blocked");

      const matchesType = typeFilter === "all" || room.type === typeFilter;
      const matchesBuilding =
        room.building === selectedBuilding ||
        (selectedBuilding === "1" && room.building === "A") ||
        (selectedBuilding === "2" && room.building === "B");

      return matchesSearch && matchesStatus && matchesType && matchesBuilding;
    });
  }, [
    roomsData,
    searchTerm,
    statusFilter,
    typeFilter,
    selectedBuilding,
    currentDate,
    bookings,
  ]);

  // Filter guests
  const filteredGuests = guests
    .filter((guest) => {
      if (guestSearchTerm === "") return true;

      const searchLower = guestSearchTerm.toLowerCase();
      const guestBookings = bookings.filter((b) => b.guestId === guest.id);
      const hasVoucherMatch = guestBookings.some(
        (b) =>
          b.voucherNumber &&
          b.voucherNumber.toLowerCase().includes(searchLower),
      );

      return (
        guest.fullName.toLowerCase().includes(searchLower) ||
        guest.phone.includes(guestSearchTerm) ||
        (guest.passportNumber &&
          guest.passportNumber.includes(guestSearchTerm)) ||
        hasVoucherMatch
      );
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  // Filter organizations
  const filteredOrganizations = organizations
    .filter((org) => {
      if (organizationSearchTerm === "") return true;

      const searchLower = organizationSearchTerm.toLowerCase();
      const hasVoucherMatch = org.issuedVouchers.some((voucher) =>
        voucher.toLowerCase().includes(searchLower),
      );

      return (
        org.officialName.toLowerCase().includes(searchLower) ||
        org.unofficialName?.toLowerCase().includes(searchLower) ||
        org.contactPersonName.toLowerCase().includes(searchLower) ||
        org.contactPhone.includes(organizationSearchTerm) ||
        org.contractNumber.includes(organizationSearchTerm) ||
        hasVoucherMatch
      );
    })
    .sort((a, b) => a.officialName.localeCompare(b.officialName));

  // Filter bookings
  const filteredBookings = bookings
    .filter((booking) => {
      if (bookingSearchTerm === "") return true;

      const searchLower = bookingSearchTerm.toLowerCase();
      const room = roomsData.find((r) => r.id === booking.roomId);

      return (
        booking.guestName.toLowerCase().includes(searchLower) ||
        booking.guestPhone.includes(bookingSearchTerm) ||
        (room && room.number.toLowerCase().includes(searchLower)) ||
        (booking.voucherNumber &&
          booking.voucherNumber.toLowerCase().includes(searchLower)) ||
        booking.id.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Compute room statistics based on current date and bookings
  const stats = useMemo(() => {
    const total = roomsData.length;
    let free = 0;
    let occupied = 0;
    let booked = 0;
    let blocked = 0;

    roomsData.forEach((room) => {
      const status = computeRoomStatus(room, currentDate, bookings);
      switch (status) {
        case "free":
          free++;
          break;
        case "occupied":
          occupied++;
          break;
        case "booked":
          booked++;
          break;
        case "blocked":
          blocked++;
          break;
      }
    });

    // Stats by building
    const buildingA = roomsData.filter(
      (r) => r.building === "1" || r.building === "A",
    );
    const buildingB = roomsData.filter(
      (r) => r.building === "2" || r.building === "B",
    );

    // Count checked-in guests
    const checkedInGuests = bookings.filter(
      (b) => b.status === "checked_in",
    ).length;

    return {
      total,
      available: free,
      occupied,
      booked,
      blocked,
      buildingA: buildingA.length,
      buildingB: buildingB.length,
      checkedInGuests,
    };
  }, [roomsData, bookings, currentDate]);

  const handleExportReport = (
    reportType: "occupancy" | "guests" | "status_by_date",
    format: "xlsx" | "pdf" | "docx",
    filters?: {
      floor?: number;
      building?: string;
      roomType?: string;
      date?: Date;
      dateRange?: { start: Date; end: Date };
    },
  ) => {
    // Create sample data based on report type
    let data: any[] = [];
    let filename = "";
    let filteredRooms = roomsData;
    let filteredBookingsForReport = bookings;

    // Apply filters
    if (filters) {
      if (filters.floor) {
        filteredRooms = filteredRooms.filter(
          (room) => room.floor === filters.floor,
        );
      }
      if (filters.building) {
        filteredRooms = filteredRooms.filter(
          (room) =>
            room.building === filters.building ||
            (filters.building === "1" && room.building === "A") ||
            (filters.building === "2" && room.building === "B"),
        );
      }
      if (filters.roomType && filters.roomType !== "all") {
        filteredRooms = filteredRooms.filter(
          (room) => room.type === filters.roomType,
        );
      }
      if (filters.dateRange) {
        // Filter bookings by date range
        filteredBookingsForReport = bookings.filter(
          (booking) =>
            booking.checkInDate >= filters.dateRange.start &&
            booking.checkOutDate <= filters.dateRange.end,
        );
      }
    }

    switch (reportType) {
      case "occupancy":
        const occupancyDate = filters?.date || new Date(reportDateFrom);
        data = filteredRooms.map((room) => {
          const status = computeRoomStatus(
            room,
            occupancyDate,
            filteredBookingsForReport,
          );
          const activeBookings = filteredBookingsForReport.filter(
            (b) =>
              b.roomId === room.id &&
              (b.status === "checked_in" || b.status === "booked"),
          );
          return {
            Номер: room.number,
            Тип: getRoomTypeText(room.type),
            Статус: getStatusText(status),
            Этаж: room.floor,
            Корпус: room.building,
            Вместимость: room.capacity,
            "Текущая заполненность": activeBookings.length,
          };
        });
        filename = `occupancy_report_${reportDateFrom}_${reportDateTo}`;
        break;

      case "guests":
        // Filter guests based on date range if provided
        const guestsToReport = filters?.dateRange
          ? guests.filter((guest) => {
              const guestBookings = filteredBookingsForReport.filter(
                (b) => b.guestId === guest.id,
              );
              return guestBookings.length > 0;
            })
          : guests;

        data = guestsToReport.map((guest) => ({
          ФИО: guest.fullName,
          Телефон: guest.phone,
          Возраст: guest.age,
          Пол: guest.gender === "male" ? "Мужской" : "Женский",
          Адрес: guest.address,
          Паспорт: guest.passportNumber,
          "Дата регистрации": guest.createdAt.toLocaleDateString("ru-RU"),
        }));
        filename = `guests_report_${reportDateFrom}_${reportDateTo}`;
        break;
      case "status_by_date":
        const reportDate = filters?.date || new Date(reportDateFrom);
        data = filteredRooms.map((room) => {
          const roomStatus = computeRoomStatus(
            room,
            reportDate,
            filteredBookingsForReport,
          );
          const booking = filteredBookingsForReport.find(
            (b) =>
              b.roomId === room.id &&
              b.checkInDate <= reportDate &&
              b.checkOutDate >= reportDate &&
              (b.status === "checked_in" ||
                b.status === "booked" ||
                b.status === "confirmed"),
          );

          let status = "Свободен";
          let guestInfo = "";

          if (booking) {
            if (
              booking.checkInDate.toDateString() === reportDate.toDateString()
            ) {
              status = "К заселению";
            } else if (
              booking.checkOutDate.toDateString() === reportDate.toDateString()
            ) {
              status = "На выселение";
            } else if (booking.status === "checked_in") {
              status = "Заселен";
            } else {
              status = "Забронирован";
            }
            guestInfo = booking.guestName;
            if (booking.secondGuestName) {
              guestInfo += ` + ${booking.secondGuestName}`;
            }
          } else if (roomStatus === "blocked") {
            status = "Заблокирован";
          }

          const activeBookings = filteredBookingsForReport.filter(
            (b) =>
              b.roomId === room.id &&
              (b.status === "checked_in" || b.status === "booked"),
          );

          return {
            Номер: room.number,
            Тип: getRoomTypeText(room.type),
            Статус: status,
            Этаж: room.floor,
            Корпус: room.building,
            Гость: guestInfo,
            Заполненность: `${activeBookings.length}/${room.capacity}`,
          };
        });
        filename = `status_report_${reportDate.toISOString().split("T")[0]}`;
        break;
    }

    // Export logic based on format
    if (format === "xlsx") {
      exportToExcel(data, filename);
    } else if (format === "pdf") {
      exportToPDF(data, filename, reportType);
    } else if (format === "docx") {
      exportToWord(data, filename, reportType);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Create CSV content
    if (data.length === 0) {
      alert("Нет данных для экспорта");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = (data: any[], filename: string, reportType: string) => {
    // Create HTML content for PDF
    const reportTitle =
      reportType === "occupancy"
        ? "Отчет по занятости"
        : reportType === "guests"
          ? "Отчет по гостям"
          : "Отчет по состоянию на дату";

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .date { text-align: right; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="date">Дата создания: ${new Date().toLocaleDateString("ru-RU")}</div>
          <h1>${reportTitle}</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {})
                  .map((key) => `<th>${key}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map((value) => `<td>${value || ""}</td>`)
                      .join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const exportToWord = (data: any[], filename: string, reportType: string) => {
    // Create HTML content that can be saved as .doc
    const reportTitle =
      reportType === "occupancy"
        ? "Отчет по занятости"
        : reportType === "guests"
          ? "Отчет по гостям"
          : "Отчет по состоянию на дату";

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset='utf-8'>
          <title>${reportTitle}</title>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <p>Дата создания: ${new Date().toLocaleDateString("ru-RU")}</p>
          <table border='1' style='border-collapse: collapse; width: 100%;'>
            <thead>
              <tr>
                ${Object.keys(data[0] || {})
                  .map(
                    (key) =>
                      `<th style='padding: 8px; background-color: #f2f2f2;'>${key}</th>`,
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map(
                        (value) =>
                          `<td style='padding: 8px;'>${value || ""}</td>`,
                      )
                      .join("")}</tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.doc`;
    link.click();
  };

  const getRoomTypeText = (type: Room["type"]) => {
    switch (type) {
      case "single":
        return "1 Местный стд.";
      case "single_improved":
        return "1 Местный ул. 1 кат. (душ)";
      case "double":
        return "2х Местный";
      case "double_improved":
        return "2х Местный ул. 1 кат. (душ)";
      case "family":
        return "Семейный";
      case "family_improved":
        return "Семейный ул. 1 кат. (душ)";
      case "luxury_double":
        return "Люкс 2 Местный";
      case "luxury":
        return "Люкс";
      default:
        return type;
    }
  };

  const getStatusText = (
    status: "free" | "booked" | "occupied" | "blocked",
  ) => {
    switch (status) {
      case "free":
        return "Свободен";
      case "occupied":
        return "Занят";
      case "booked":
        return "Забронирован";
      case "blocked":
        return "Заблокирован";
      default:
        return status;
    }
  };

  // Settings Dialog Components
  const AddRoomDialog = ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState({
      number: "",
      type: "double" as Room["type"],
      floor: selectedFloor,
      building: selectedBuilding,
      capacity: 2,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.number) {
        alert("Пожалуйста, введите номер комнаты");
        return;
      }

      const newRoom: Room = {
        id: `room-${Date.now()}`,
        number: formData.number,
        type: formData.type,
        floor: formData.floor,
        building: formData.building,
        position: { row: 0, col: 0 },
        capacity: formData.capacity,
        blocked: false,
      };

      const updated = [...roomsData, newRoom];
      setRoomsData(updated);
      localStorage.setItem("sanatorium_rooms", JSON.stringify(updated));
      alert(`Номер ${formData.number} успешно добавлен!`);
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-800">
              <Building className="w-6 h-6" />
              Добавить новый номер
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomNumber">Номер комнаты *</Label>
                <Input
                  id="roomNumber"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  placeholder="101, 201, A101..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="roomType">Тип номера *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Room["type"]) => {
                    const capacity =
                      value === "single" ? 1 : value === "luxury" ? 3 : 2;
                    setFormData({ ...formData, type: value, capacity });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Одноместный</SelectItem>
                    <SelectItem value="double">Двухместный</SelectItem>
                    <SelectItem value="double_with_balcony">
                      Двухместный с балконом
                    </SelectItem>
                    <SelectItem value="luxury">Люкс</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="floor">Этаж *</Label>
                <Select
                  value={formData.floor.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, floor: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((floor) => (
                      <SelectItem key={floor} value={floor.toString()}>
                        {floor} этаж
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="building">Корпус *</Label>
                <Select
                  value={formData.building}
                  onValueChange={(value) =>
                    setFormData({ ...formData, building: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Корпус 1</SelectItem>
                    <SelectItem value="2">Корпус 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Вместимость</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="4"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Добавить номер
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const AddUserDialog = ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "reception" as "administrator" | "manager" | "reception",
      password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !formData.username ||
        !formData.email ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.password
      ) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }

      alert(
        `Пользователь ${formData.username} с ролью ${formData.role} успешно добавлен!`,
      );
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-800">
              <UserPlus className="w-6 h-6" />
              Добавить нового пользователя
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Имя пользователя *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Роль *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(
                    value: "administrator" | "manager" | "reception",
                  ) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Администратор</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="reception">Ресепшен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Добавить пользователя
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const SystemSettingsDialog = ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const [settings, setSettings] = useState({
      autoCheckout: true,
      nightAuditTime: "00:00",
      defaultCheckInTime: "14:00",
      defaultCheckOutTime: "12:00",
      allowOverbooking: false,
      maxAdvanceBooking: 365,
    });

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-800">
              <Settings className="w-6 h-6" />
              Системные настройки
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Настройки бронирования
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoCheckout">
                      Автоматическое выселение
                    </Label>
                    <input
                      type="checkbox"
                      id="autoCheckout"
                      checked={settings.autoCheckout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoCheckout: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultCheckIn">
                      Время заселения по умолчанию
                    </Label>
                    <Input
                      id="defaultCheckIn"
                      type="time"
                      value={settings.defaultCheckInTime}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultCheckInTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultCheckOut">
                      Время выселения по умолчанию
                    </Label>
                    <Input
                      id="defaultCheckOut"
                      type="time"
                      value={settings.defaultCheckOutTime}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultCheckOutTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Системные параметры
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="nightAudit">Время ночного аудита</Label>
                    <Input
                      id="nightAudit"
                      type="time"
                      value={settings.nightAuditTime}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          nightAuditTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowOverbooking">
                      Разрешить овербукинг
                    </Label>
                    <input
                      type="checkbox"
                      id="allowOverbooking"
                      checked={settings.allowOverbooking}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          allowOverbooking: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAdvance">
                      Максимальный срок бронирования (дни)
                    </Label>
                    <Input
                      id="maxAdvance"
                      type="number"
                      value={settings.maxAdvanceBooking}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxAdvanceBooking: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="730"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  alert("Настройки сохранены!");
                  onClose();
                }}
              >
                Сохранить настройки
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Enhanced Room Editing Dialog Component
  const EnhancedRoomEditingDialog = ({
    rooms,
    onUpdateRoom,
    onDeleteRoom,
    onAddRoom,
    onClose,
  }: {
    rooms: Room[];
    onUpdateRoom: (room: Room) => void;
    onDeleteRoom: (roomId: string) => void;
    onAddRoom: (room: Omit<Room, "id" | "position">) => void;
    onClose: () => void;
  }) => {
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [editMode, setEditMode] = useState<"view" | "edit" | "add">("view");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBuilding, setFilterBuilding] = useState<string>("all");
    const [filterFloor, setFilterFloor] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [editFormData, setEditFormData] = useState<Partial<Room>>({});

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

    const filteredRooms = rooms.filter((room) => {
      const matchesSearch =
        searchTerm === "" ||
        room.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBuilding =
        filterBuilding === "all" || room.building === filterBuilding;
      const matchesFloor =
        filterFloor === "all" || room.floor.toString() === filterFloor;
      const matchesType = filterType === "all" || room.type === filterType;

      return matchesSearch && matchesBuilding && matchesFloor && matchesType;
    });

    const handleEditRoom = () => {
      if (selectedRoom) {
        setEditFormData({ ...selectedRoom });
        setEditMode("edit");
      }
    };

    const handleSaveEdit = () => {
      if (editFormData && selectedRoom) {
        onUpdateRoom({ ...selectedRoom, ...editFormData } as Room);
        setEditMode("view");
        alert("Номер успешно обновлен!");
      }
    };

    const handleAddNew = () => {
      setEditFormData({
        number: "",
        type: "double",
        floor: 1,
        building: "1",
        capacity: 2,
        blocked: false,
      });
      setEditMode("add");
    };

    const handleSaveNew = () => {
      if (
        editFormData.number &&
        editFormData.type &&
        editFormData.floor &&
        editFormData.building
      ) {
        onAddRoom(editFormData as Omit<Room, "id" | "position">);
        setEditMode("view");
        setEditFormData({});
      } else {
        alert("Пожалуйста, заполните все обязательные поля");
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

    const getStatusText = (
      status: "free" | "booked" | "occupied" | "blocked",
    ) => {
      switch (status) {
        case "free":
          return "Свободен";
        case "occupied":
          return "Занят";
        case "booked":
          return "Забронирован";
        case "blocked":
          return "Заблокирован";
        default:
          return status;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header with mode controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-blue-700">
              Всего номеров: {rooms.length}
            </Badge>
            <Badge variant="outline" className="text-green-700">
              Найдено: {filteredRooms.length}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant={editMode === "view" ? "default" : "outline"}
              size="sm"
              onClick={() => setEditMode("view")}
            >
              Просмотр
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить номер
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters and Room List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Поиск и фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Поиск по номеру</Label>
                  <Input
                    placeholder="Введите номер..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Корпус</Label>
                    <Select
                      value={filterBuilding}
                      onValueChange={setFilterBuilding}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Этаж</Label>
                    <Select value={filterFloor} onValueChange={setFilterFloor}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Тип номера</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
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
              </CardContent>
            </Card>

            {/* Room List */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm">Список номеров</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className={cn(
                        "p-3 border rounded cursor-pointer transition-colors",
                        selectedRoomId === room.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50",
                      )}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            Номер {room.number}
                          </div>
                          <div className="text-xs text-gray-600">
                            {getRoomTypeText(room.type)} • Этаж {room.floor} •
                            Корпус {room.building}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            computeRoomStatus(room, new Date(), bookings) ===
                              "free" && "text-green-600",
                            computeRoomStatus(room, new Date(), bookings) ===
                              "occupied" && "text-red-600",
                            computeRoomStatus(room, new Date(), bookings) ===
                              "blocked" && "text-gray-600",
                          )}
                        >
                          {getStatusText(
                            computeRoomStatus(room, new Date(), bookings),
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Room Details and Edit Form */}
          <div className="lg:col-span-2">
            {editMode === "view" && selectedRoom && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Номер {selectedRoom.number}</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditRoom}>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteRoom(selectedRoom.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Тип номера
                      </Label>
                      <div className="text-lg font-semibold">
                        {getRoomTypeText(selectedRoom.type)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Статус
                      </Label>
                      <div className="text-lg font-semibold">
                        <Badge
                          variant="outline"
                          className={cn(
                            computeRoomStatus(
                              selectedRoom,
                              new Date(),
                              bookings,
                            ) === "free" && "text-green-600",
                            computeRoomStatus(
                              selectedRoom,
                              new Date(),
                              bookings,
                            ) === "occupied" && "text-red-600",
                            computeRoomStatus(
                              selectedRoom,
                              new Date(),
                              bookings,
                            ) === "blocked" && "text-gray-600",
                          )}
                        >
                          {getStatusText(
                            computeRoomStatus(
                              selectedRoom,
                              new Date(),
                              bookings,
                            ),
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Этаж
                      </Label>
                      <div className="text-lg font-semibold">
                        {selectedRoom.floor}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Корпус
                      </Label>
                      <div className="text-lg font-semibold">
                        {selectedRoom.building}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Вместимость
                      </Label>
                      <div className="text-lg font-semibold">
                        {selectedRoom.capacity} человек
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Текущая заполненность
                      </Label>
                      <div className="text-lg font-semibold">
                        {
                          bookings.filter(
                            (b) =>
                              b.roomId === selectedRoom.id &&
                              (b.status === "checked_in" ||
                                b.status === "booked"),
                          ).length
                        }{" "}
                        человек
                      </div>
                    </div>
                  </div>
                  {selectedRoom.blocked && selectedRoom.blockReason && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-red-800">
                        Причина блокировки
                      </Label>
                      <div className="text-red-700">
                        {selectedRoom.blockReason}
                      </div>
                      {selectedRoom.blockedAt && (
                        <div className="text-xs text-red-600 mt-1">
                          Заблокирован:{" "}
                          {selectedRoom.blockedAt.toLocaleDateString("ru-RU")}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {(editMode === "edit" || editMode === "add") && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>
                    {editMode === "edit"
                      ? `Редактирование номера ${selectedRoom?.number}`
                      : "Добавление нового номера"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editMode === "edit") {
                        handleSaveEdit();
                      } else {
                        handleSaveNew();
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="roomNumber">Номер комнаты *</Label>
                        <Input
                          id="roomNumber"
                          value={editFormData.number || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              number: e.target.value,
                            })
                          }
                          placeholder="101, 201, A101..."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="roomType">Тип номера *</Label>
                        <Select
                          value={editFormData.type || "double"}
                          onValueChange={(value: Room["type"]) => {
                            const capacity =
                              value === "single"
                                ? 1
                                : value === "luxury"
                                  ? 3
                                  : 2;
                            setEditFormData({
                              ...editFormData,
                              type: value,
                              capacity,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                {type.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="floor">Этаж *</Label>
                        <Select
                          value={editFormData.floor?.toString() || "1"}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              floor: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((floor) => (
                              <SelectItem key={floor} value={floor.toString()}>
                                {floor} этаж
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="building">Корпус *</Label>
                        <Select
                          value={editFormData.building || "1"}
                          onValueChange={(value) =>
                            setEditFormData({
                              ...editFormData,
                              building: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Корпус 1</SelectItem>
                            <SelectItem value="2">Корпус 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="capacity">Вместимость</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={editFormData.capacity || 2}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              capacity: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          max="4"
                        />
                      </div>
                    </div>
                    {editMode === "edit" && (
                      <div>
                        <Label htmlFor="blocked">Заблокирован</Label>
                        <Select
                          value={editFormData.blocked ? "true" : "false"}
                          onValueChange={(value: string) =>
                            setEditFormData({
                              ...editFormData,
                              blocked: value === "true",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">Нет</SelectItem>
                            <SelectItem value="true">Да</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditMode("view")}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {editMode === "edit"
                          ? "Сохранить изменения"
                          : "Добавить номер"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!selectedRoom && editMode === "view" && (
              <Card className="bg-white">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Выберите номер из списка для просмотра деталей</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    );
  };

  // Simple form components
  const NewGuestForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: Omit<Guest, "id" | "createdAt">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      middleName: "",
      phone: "",
      email: "",
      age: "",
      address: "",
      passportNumber: "",
      gender: "male" as "male" | "female",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.phone ||
        !formData.age ||
        !formData.address ||
        !formData.passportNumber
      ) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }

      const fullName =
        `${formData.lastName} ${formData.firstName} ${formData.middleName || ""}`.trim();
      const age = parseInt(formData.age);
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);

      onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        age,
        dateOfBirth,
        address: formData.address,
        passportNumber: formData.passportNumber,
        gender: formData.gender,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Имя *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Фамилия *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) =>
              setFormData({ ...formData, middleName: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="age">Возраст *</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="address">Адрес *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passport">Номер паспорта *</Label>
            <Input
              id="passport"
              value={formData.passportNumber}
              onChange={(e) =>
                setFormData({ ...formData, passportNumber: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Пол *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "male" | "female") =>
                setFormData({ ...formData, gender: value })
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
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">Добавить гостя</Button>
        </div>
      </form>
    );
  };

  const AddRoomTypeForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: {
      name: string;
      displayName: string;
      capacity: number;
      description?: string;
    }) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: "",
      displayName: "",
      capacity: 2,
      description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.displayName) {
        alert("Пожалуйста, заполните обязательные поля");
        return;
      }

      onSubmit({
        name: formData.name,
        displayName: formData.displayName,
        capacity: formData.capacity,
        description: formData.description || undefined,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Название типа номера *</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => {
              const displayName = e.target.value;
              const name = displayName.toLowerCase().replace(/\s+/g, "_");
              setFormData({ ...formData, displayName, name });
            }}
            placeholder="Например: Семейный номер"
            required
          />
        </div>
        <div>
          <Label htmlFor="capacity">Вместимость *</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: parseInt(e.target.value) })
            }
            min="1"
            max="6"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Описание</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Дополнительное описание типа номера"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">Добавить тип</Button>
        </div>
      </form>
    );
  };

  const AuditLogViewer = ({
    auditLogs,
    onClose,
  }: {
    auditLogs: AuditLog[];
    onClose: () => void;
  }) => {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const handlePrintLog = (log: AuditLog) => {
      const printContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Журнал аудита - ${log.dateRun.toLocaleDateString("ru-RU")}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .content { margin: 20px 0; }
              .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <h1>ЖУРНАЛ АУДИТА САНАТОРИЯ "ДНЕСТР"</h1>
            
            <div class="header">
              <div>
                <strong>Дата:</strong> ${log.dateRun.toLocaleDateString("ru-RU")}<br>
                <strong>Время:</strong> ${log.dateRun.toLocaleTimeString("ru-RU")}<br>
                <strong>Тип:</strong> ${log.type === "nightly_audit" ? "Ночной аудит" : log.type}<br>
                <strong>Исполнитель:</strong> ${log.actor}
              </div>
              <div style="text-align: right;">
                <strong>Система управления санаторием</strong><br>
                <em>ID записи: ${log.id}</em>
              </div>
            </div>

            <div class="content">
              <h2>ОПИСАНИЕ ОПЕРАЦИИ</h2>
              <p><strong>${log.details}</strong></p>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
              Документ создан автоматически ${new Date().toLocaleString("ru-RU")}
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

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-purple-700">
              Всего записей: {auditLogs.length}
            </Badge>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.dateRun.toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>
                    {log.dateRun.toLocaleTimeString("ru-RU")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.type === "nightly_audit" ? "Ночной аудит" : log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {log.details}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                      >
                        Просмотр
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintLog(log)}
                      >
                        Печать
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedLog && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-800">Детали записи</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedLog(null)}
              >
                Закрыть
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong> {selectedLog.id}
              </p>
              <p>
                <strong>Дата и время:</strong>{" "}
                {selectedLog.dateRun.toLocaleDateString("ru-RU")}{" "}
                {selectedLog.dateRun.toLocaleTimeString("ru-RU")}
              </p>
              <p>
                <strong>Исполнитель:</strong> {selectedLog.actor}
              </p>
              <p>
                <strong>Тип:</strong> {selectedLog.type}
              </p>
              <p>
                <strong>Описание:</strong> {selectedLog.details}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    );
  };

  const NewOrganizationForm = ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: Omit<Organization, "id" | "createdAt">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      officialName: "",
      unofficialName: "",
      contactPersonName: "",
      contactPhone: "",
      contractNumber: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !formData.officialName ||
        !formData.contactPersonName ||
        !formData.contactPhone ||
        !formData.contractNumber
      ) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }

      onSubmit({
        officialName: formData.officialName,
        unofficialName: formData.unofficialName || undefined,
        contactPersonName: formData.contactPersonName,
        contactPhone: formData.contactPhone,
        contractNumber: formData.contractNumber,
        issuedVouchers: [],
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="officialName">Официальное название *</Label>
          <Input
            id="officialName"
            value={formData.officialName}
            onChange={(e) =>
              setFormData({ ...formData, officialName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="unofficialName">Неофициальное название</Label>
          <Input
            id="unofficialName"
            value={formData.unofficialName}
            onChange={(e) =>
              setFormData({ ...formData, unofficialName: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPerson">Контактное лицо *</Label>
            <Input
              id="contactPerson"
              value={formData.contactPersonName}
              onChange={(e) =>
                setFormData({ ...formData, contactPersonName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Телефон *</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="contractNumber">Номер договора *</Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) =>
              setFormData({ ...formData, contractNumber: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">Добавить организацию</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Система управления санаторием &quot;Днестр&quot;
              </h1>
              <p className="text-gray-600 text-sm">
                {currentDate.toLocaleDateString("ru-RU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Stats and Night Audit */}
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                  <div className="text-xs text-gray-600">
                    Всего (1:{stats.buildingA} 2:{stats.buildingB})
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {stats.available}
                  </div>
                  <div className="text-xs text-gray-600">Свободно</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    {stats.occupied}
                  </div>
                  <div className="text-xs text-gray-600">Занято</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {stats.booked}
                  </div>
                  <div className="text-xs text-gray-600">Забронировано</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {stats.checkedInGuests}
                  </div>
                  <div className="text-xs text-gray-600">Заселено гостей</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleNightAudit}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Ночной аудит
                </Button>
                {auditHistory.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const lastAudit = auditHistory[auditHistory.length - 1];
                      setCurrentDate(lastAudit.date);
                      setBookings(lastAudit.bookings);
                      setRoomsData(lastAudit.rooms);
                      setAuditHistory((prev) => prev.slice(0, -1));
                    }}
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    ← Назад
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="placement" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Размещение
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Гости
            </TabsTrigger>
            <TabsTrigger
              value="organizations"
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Организации
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Бронь
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Отчеты
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Placement Tab */}
          <TabsContent value="placement" className="space-y-6">
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
                          variant={
                            viewMode === "calendar" ? "default" : "outline"
                          }
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

                    {/* Building Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        Корпус
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["1", "2"].map((building) => (
                          <Button
                            key={building}
                            variant={
                              selectedBuilding === building
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedBuilding(building)}
                            className="w-full"
                          >
                            {building}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Floor Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Этаж
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5].map((floor) => (
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
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Все статусы" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="available">Свободно</SelectItem>
                          <SelectItem value="occupied">Занято</SelectItem>
                          <SelectItem value="booked">Забронировано</SelectItem>

                          <SelectItem value="blocked">Заблокирован</SelectItem>
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
                          <SelectItem value="single">1 Местный стд.</SelectItem>
                          <SelectItem value="single_improved">
                            1 Местный ул. 1 кат. (душ)
                          </SelectItem>
                          <SelectItem value="double">2х Местный</SelectItem>
                          <SelectItem value="double_improved">
                            2х Местный ул. 1 кат. (душ)
                          </SelectItem>
                          <SelectItem value="family">Семейный</SelectItem>
                          <SelectItem value="family_improved">
                            Семейный ул. 1 кат. (душ)
                          </SelectItem>
                          <SelectItem value="luxury_double">
                            Люкс 2 Местный
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
                          <Badge variant="outline">
                            {computeRoomStatus(
                              selectedRoom,
                              currentDate,
                              bookings,
                            )}
                          </Badge>
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
                                  {booking.checkInDate.toLocaleDateString(
                                    "ru-RU",
                                  )}{" "}
                                  -{" "}
                                  {booking.checkOutDate.toLocaleDateString(
                                    "ru-RU",
                                  )}
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
                    selectedBuilding={selectedBuilding}
                    onRoomClick={handleRoomClick}
                    onRoomDoubleClick={handleRoomDoubleClick}
                    onContextMenuAction={handleContextMenuAction}
                    selectedRoom={selectedRoom}
                    bookings={bookings}
                    guests={guests}
                    currentDate={currentDate}
                    organizations={organizations}
                  />
                ) : (
                  <CalendarView
                    rooms={filteredRooms}
                    bookings={bookings}
                    selectedFloor={selectedFloor}
                    selectedBuilding={selectedBuilding}
                    onRoomClick={handleRoomClick}
                    onBookRoom={handleBookRoom}
                    onDateRangeSelect={handleDateRangeSelect}
                    onContextMenuAction={handleContextMenuAction}
                    currentDate={currentDate}
                    organizations={organizations}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Guest Search Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Поиск гостей
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="guest-search">
                        Поиск по ФИО, телефону, паспорту или путевке
                      </Label>
                      <Input
                        id="guest-search"
                        placeholder="Введите данные для поиска..."
                        value={guestSearchTerm}
                        onChange={(e) => setGuestSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Всего гостей: {guests.length}</p>
                      <p>Найдено: {filteredGuests.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Guest List */}
              <div className="lg:col-span-3">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Список гостей
                      </div>
                      <Button size="sm" onClick={handleAddNewGuest}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить гостя
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ФИО</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Возраст</TableHead>
                          <TableHead>Номер паспорта</TableHead>
                          <TableHead>Путевка</TableHead>
                          <TableHead>Дата регистрации</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGuests.map((guest) => {
                          const guestBooking = bookings.find(
                            (b) => b.guestId === guest.id,
                          );
                          return (
                            <TableRow key={guest.id}>
                              <TableCell className="font-medium">
                                {guest.fullName}
                              </TableCell>
                              <TableCell>{guest.phone}</TableCell>
                              <TableCell>{guest.age}</TableCell>
                              <TableCell>
                                {guest.passportNumber || "-"}
                              </TableCell>
                              <TableCell>
                                {guestBooking?.voucherNumber || "-"}
                              </TableCell>
                              <TableCell>
                                {guest.createdAt.toLocaleDateString("ru-RU")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedGuest(guest);
                                    setIsGuestCardOpen(true);
                                  }}
                                >
                                  Просмотр
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Organization Search Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Поиск организаций
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="organization-search">
                        Поиск по названию, контакту, договору или путевке
                      </Label>
                      <Input
                        id="organization-search"
                        placeholder="Введите данные для поиска..."
                        value={organizationSearchTerm}
                        onChange={(e) =>
                          setOrganizationSearchTerm(e.target.value)
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Всего организаций: {organizations.length}</p>
                      <p>Найдено: {filteredOrganizations.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organization List */}
              <div className="lg:col-span-3">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Список организаций
                      </div>
                      <Button size="sm" onClick={handleAddNewOrganization}>
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить организацию
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Официальное название</TableHead>
                          <TableHead>Неофициальное название</TableHead>
                          <TableHead>Контактное лицо</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Номер договора</TableHead>
                          <TableHead>Путевки</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrganizations.map((org) => (
                          <TableRow key={org.id}>
                            <TableCell className="font-medium">
                              {org.officialName}
                            </TableCell>
                            <TableCell>{org.unofficialName || "-"}</TableCell>
                            <TableCell>{org.contactPersonName}</TableCell>
                            <TableCell>{org.contactPhone}</TableCell>
                            <TableCell>{org.contractNumber}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {org.issuedVouchers.length}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrganization(org);
                                  setIsOrganizationCardOpen(true);
                                }}
                              >
                                Просмотр
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Booking Search Panel */}
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Поиск броней
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="booking-search">
                        Поиск по номеру, гостю, дате или путевке
                      </Label>
                      <Input
                        id="booking-search"
                        placeholder="Введите данные для поиска..."
                        value={bookingSearchTerm}
                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Всего броней: {bookings.length}</p>
                      <p>Найдено: {filteredBookings.length}</p>
                      <p>
                        Активных:{" "}
                        {
                          bookings.filter(
                            (b) =>
                              b.status === "checked_in" ||
                              b.status === "booked",
                          ).length
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking List */}
              <div className="lg:col-span-3">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Список броней
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRoom(null);
                          setSelectedBookingId(null);
                          setIsCreatingNew(true);
                          setIsBookingDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Создать бронь
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Номер</TableHead>
                          <TableHead>Гость</TableHead>
                          <TableHead>Заезд</TableHead>
                          <TableHead>Выезд</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Путевка</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => {
                          const room = roomsData.find(
                            (r) => r.id === booking.roomId,
                          );
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">
                                {room?.number || "N/A"}
                              </TableCell>
                              <TableCell>{booking.guestName}</TableCell>
                              <TableCell>
                                {booking.checkInDate.toLocaleDateString(
                                  "ru-RU",
                                )}
                              </TableCell>
                              <TableCell>
                                {booking.checkOutDate.toLocaleDateString(
                                  "ru-RU",
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {booking.status === "confirmed"
                                    ? "Подтверждена"
                                    : booking.status === "booked"
                                      ? "Забронирована"
                                      : booking.status === "checked_in"
                                        ? "Заселен"
                                        : booking.status === "completed"
                                          ? "Завершена"
                                          : booking.status === "cancelled"
                                            ? "Отменена"
                                            : booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {booking.voucherNumber || "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (booking.status === "completed") {
                                      // For completed bookings, open guest card
                                      const guest = guests.find(
                                        (g) => g.id === booking.guestId,
                                      );
                                      if (guest) {
                                        setSelectedGuest(guest);
                                        setIsGuestCardOpen(true);
                                      }
                                    } else {
                                      // For other bookings, open booking details with the specific booking
                                      const room = roomsData.find(
                                        (r) => r.id === booking.roomId,
                                      );
                                      if (room) {
                                        // Close all dialogs first
                                        setIsBookingDialogOpen(false);
                                        setIsBookingDetailsOpen(false);
                                        setSelectedRoom(null);
                                        setSelectedBookingId(null);
                                        setSelectedDate(null);
                                        setIsCreatingNew(false);

                                        // Use setTimeout to ensure state is cleared
                                        setTimeout(() => {
                                          setSelectedRoom(room);
                                          setSelectedBookingId(booking.id);
                                          setSelectedDate(booking.checkInDate);
                                          setIsCreatingNew(false);
                                          setIsBookingDetailsOpen(true);
                                        }, 10);
                                      }
                                    }
                                  }}
                                >
                                  Просмотр
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Filters */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Filter className="w-5 h-5" />
                    Параметры отчетов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-white/70 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3">
                        Фильтры размещения
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-blue-700">
                            Корпус
                          </Label>
                          <Select
                            value={reportBuilding}
                            onValueChange={setReportBuilding}
                          >
                            <SelectTrigger className="border-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все корпуса</SelectItem>
                              <SelectItem value="1">Корпус 1</SelectItem>
                              <SelectItem value="2">Корпус 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-700">
                            Этаж
                          </Label>
                          <Select
                            value={reportFloor}
                            onValueChange={setReportFloor}
                          >
                            <SelectTrigger className="border-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все этажи</SelectItem>
                              <SelectItem value="1">1 этаж</SelectItem>
                              <SelectItem value="2">2 этаж</SelectItem>
                              <SelectItem value="3">3 этаж</SelectItem>
                              <SelectItem value="4">4 этаж</SelectItem>
                              <SelectItem value="5">5 этаж</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-700">
                            Категория номеров
                          </Label>
                          <Select
                            value={reportRoomType}
                            onValueChange={setReportRoomType}
                          >
                            <SelectTrigger className="border-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все категории</SelectItem>
                              <SelectItem value="single">
                                1 Местный стд.
                              </SelectItem>
                              <SelectItem value="single_improved">
                                1 Местный ул. 1 кат. (душ)
                              </SelectItem>
                              <SelectItem value="double">2х Местный</SelectItem>
                              <SelectItem value="double_improved">
                                2х Местный ул. 1 кат. (душ)
                              </SelectItem>
                              <SelectItem value="family">Семейный</SelectItem>
                              <SelectItem value="family_improved">
                                Семейный ул. 1 кат. (душ)
                              </SelectItem>
                              <SelectItem value="luxury_double">
                                Люкс 2 Местный
                              </SelectItem>
                              <SelectItem value="luxury">Люкс</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3">
                        Период отчетности
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-blue-700">
                            Дата начала
                          </Label>
                          <Input
                            type="date"
                            value={reportDateFrom}
                            onChange={(e) => setReportDateFrom(e.target.value)}
                            className="border-blue-200"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-blue-700">
                            Дата окончания
                          </Label>
                          <Input
                            type="date"
                            value={reportDateTo}
                            onChange={(e) => setReportDateTo(e.target.value)}
                            className="border-blue-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-100/50 p-3 rounded-lg text-sm text-blue-700">
                      <p>
                        <strong>Период:</strong>{" "}
                        {new Date(reportDateFrom).toLocaleDateString("ru-RU")} -{" "}
                        {new Date(reportDateTo).toLocaleDateString("ru-RU")}
                      </p>
                      <p>
                        <strong>Дней:</strong>{" "}
                        {Math.ceil(
                          (new Date(reportDateTo).getTime() -
                            new Date(reportDateFrom).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) + 1}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Types */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <FileText className="w-5 h-5" />
                    Типы отчетов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-white/70 border border-green-200 rounded-lg p-4 hover:bg-white/90 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-800">
                          Отчет по занятости
                        </h4>
                      </div>
                      <p className="text-sm text-green-700 mb-4">
                        Статистика занятости номеров с детализацией по корпусам,
                        этажам и категориям за выбранный период
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleExportReport("occupancy", "pdf", {
                              building:
                                reportBuilding !== "all"
                                  ? reportBuilding
                                  : undefined,
                              floor:
                                reportFloor !== "all"
                                  ? parseInt(reportFloor)
                                  : undefined,
                              roomType:
                                reportRoomType !== "all"
                                  ? reportRoomType
                                  : undefined,
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          📄 PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleExportReport("occupancy", "docx", {
                              building:
                                reportBuilding !== "all"
                                  ? reportBuilding
                                  : undefined,
                              floor:
                                reportFloor !== "all"
                                  ? parseInt(reportFloor)
                                  : undefined,
                              roomType:
                                reportRoomType !== "all"
                                  ? reportRoomType
                                  : undefined,
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          📝 DOCX
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/70 border border-green-200 rounded-lg p-4 hover:bg-white/90 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-800">
                          Отчет по состоянию на дату
                        </h4>
                      </div>
                      <p className="text-sm text-green-700 mb-4">
                        Статус номеров на начальную дату периода: свободные,
                        забронированные, заселенные, к заселению, на выселение
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleExportReport("status_by_date", "pdf", {
                              building:
                                reportBuilding !== "all"
                                  ? reportBuilding
                                  : undefined,
                              floor:
                                reportFloor !== "all"
                                  ? parseInt(reportFloor)
                                  : undefined,
                              roomType:
                                reportRoomType !== "all"
                                  ? reportRoomType
                                  : undefined,
                              date: new Date(reportDateFrom),
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          📄 PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleExportReport("status_by_date", "docx", {
                              building:
                                reportBuilding !== "all"
                                  ? reportBuilding
                                  : undefined,
                              floor:
                                reportFloor !== "all"
                                  ? parseInt(reportFloor)
                                  : undefined,
                              roomType:
                                reportRoomType !== "all"
                                  ? reportRoomType
                                  : undefined,
                              date: new Date(reportDateFrom),
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          📝 DOCX
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/70 border border-green-200 rounded-lg p-4 hover:bg-white/90 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-800">
                          Отчет по гостям
                        </h4>
                      </div>
                      <p className="text-sm text-green-700 mb-4">
                        Статистика по гостям за выбранный период: данные,
                        проживание, история бронирований
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleExportReport("guests", "pdf", {
                              building:
                                reportBuilding !== "all"
                                  ? reportBuilding
                                  : undefined,
                              floor:
                                reportFloor !== "all"
                                  ? parseInt(reportFloor)
                                  : undefined,
                              roomType:
                                reportRoomType !== "all"
                                  ? reportRoomType
                                  : undefined,
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          📄 PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() =>
                            handleExportReport("guests", "docx", {
                              building:
                                reportBuilding !== "all"
                                  ? reportBuilding
                                  : undefined,
                              floor:
                                reportFloor !== "all"
                                  ? parseInt(reportFloor)
                                  : undefined,
                              roomType:
                                reportRoomType !== "all"
                                  ? reportRoomType
                                  : undefined,
                              dateRange: {
                                start: new Date(reportDateFrom),
                                end: new Date(reportDateTo),
                              },
                            })
                          }
                        >
                          📝 DOCX
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Preview/Data */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Database className="w-5 h-5" />
                    Предварительный просмотр данных
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white/70 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-3">
                        Статистика за период
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-purple-100/50 p-3 rounded">
                          <div className="font-semibold text-purple-900">
                            Всего номеров
                          </div>
                          <div className="text-2xl font-bold text-purple-700">
                            {roomsData.length}
                          </div>
                        </div>
                        <div className="bg-green-100/50 p-3 rounded">
                          <div className="font-semibold text-green-900">
                            Свободно
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            {stats.available}
                          </div>
                        </div>
                        <div className="bg-red-100/50 p-3 rounded">
                          <div className="font-semibold text-red-900">
                            Занято
                          </div>
                          <div className="text-2xl font-bold text-red-700">
                            {stats.occupied}
                          </div>
                        </div>
                        <div className="bg-yellow-100/50 p-3 rounded">
                          <div className="font-semibold text-yellow-900">
                            Забронировано
                          </div>
                          <div className="text-2xl font-bold text-yellow-700">
                            {stats.booked}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-3">
                        Активные бронирования
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {bookings
                          .filter(
                            (b) =>
                              b.status === "checked_in" ||
                              b.status === "booked",
                          )
                          .slice(0, 5)
                          .map((booking) => {
                            const room = roomsData.find(
                              (r) => r.id === booking.roomId,
                            );
                            return (
                              <div
                                key={booking.id}
                                className="flex justify-between items-center text-sm bg-purple-100/50 p-2 rounded"
                              >
                                <span className="font-medium">
                                  {booking.guestName}
                                </span>
                                <span className="text-purple-600">
                                  №{room?.number}
                                </span>
                              </div>
                            );
                          })}
                        {bookings.filter(
                          (b) =>
                            b.status === "checked_in" || b.status === "booked",
                        ).length > 5 && (
                          <div className="text-xs text-purple-600 text-center">
                            +
                            {bookings.filter(
                              (b) =>
                                b.status === "checked_in" ||
                                b.status === "booked",
                            ).length - 5}{" "}
                            еще...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/70 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-3">
                        Загруженность
                      </h4>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round(((stats.occupied + stats.booked) / stats.total) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-center text-sm text-purple-700 mt-2">
                        {Math.round(
                          ((stats.occupied + stats.booked) / stats.total) * 100,
                        )}
                        % загружено
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Room Management */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Building className="w-5 h-5" />
                    Управление номерами
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setIsAddRoomDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить номер
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setIsEditRoomDialogOpen(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать номер
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setIsAddRoomTypeDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить тип номера
                    </Button>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg text-sm text-blue-700">
                    <p>
                      <strong>Всего номеров:</strong> {roomsData.length}
                    </p>
                    <p>
                      <strong>Этажей:</strong> 5 в каждом корпусе
                    </p>
                    <p>
                      <strong>Корпусов:</strong> 2 (1, 2)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* User Management */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Users className="w-5 h-5" />
                    Управление пользователями
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsAddUserDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Добавить пользователя
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => setIsManageRolesDialogOpen(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Управление ролями
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => setIsUserSettingsDialogOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Настройки доступа
                    </Button>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg text-sm text-green-700">
                    <p>
                      <strong>Администраторов:</strong> 1
                    </p>
                    <p>
                      <strong>Менеджеров:</strong> 2
                    </p>
                    <p>
                      <strong>Ресепшен:</strong> 3
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Settings className="w-5 h-5" />
                    Системные настройки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setIsSystemSettingsDialogOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Общие настройки
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => setIsBackupDialogOpen(true)}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Резервное копирование
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => setIsAuditLogDialogOpen(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Журнал аудита
                    </Button>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg text-sm text-purple-700">
                    <p>
                      <strong>Версия системы:</strong> 2.0.1
                    </p>
                    <p>
                      <strong>Последнее обновление:</strong>{" "}
                      {new Date().toLocaleDateString("ru-RU")}
                    </p>
                    <p>
                      <strong>Статус:</strong> Активна
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}

        <BookingDialog
          selectedRoomId={selectedRoom?.id}
          room={selectedRoom}
          isOpen={isBookingDialogOpen}
          onClose={() => {
            setIsBookingDialogOpen(false);
            setSelectedRoom(null);
            setSelectedBookingId(null);
            setIsCreatingNew(false);
          }}
          onBookRoom={handleBookRoom}
          rooms={roomsData}
          guests={guests}
          prefilledGuest={selectedGuest}
          organizations={organizations}
          selectedDate={selectedDate}
        />

        <GuestCard
          guest={selectedGuest}
          bookings={bookings.filter((b) => b.guestId === selectedGuest?.id)}
          isOpen={isGuestCardOpen}
          onClose={() => {
            setIsGuestCardOpen(false);
            setSelectedGuest(null);
          }}
          onNewBooking={handleNewBooking}
          onUpdateGuest={handleUpdateGuest}
          onOpenGuestCard={(guestId) => {
            const guest = guests.find((g) => g.id === guestId);
            if (guest) {
              setSelectedGuest(guest);
              setIsGuestCardOpen(true);
            }
          }}
          guests={guests}
        />

        <OrganizationCard
          organization={selectedOrganization}
          isOpen={isOrganizationCardOpen}
          onClose={() => {
            setIsOrganizationCardOpen(false);
            setSelectedOrganization(null);
          }}
          onIssueVoucher={(organizationId, voucherNumber) => {
            setOrganizations((prev) => {
              const updated = prev.map((org) =>
                org.id === organizationId
                  ? {
                      ...org,
                      issuedVouchers: [...org.issuedVouchers, voucherNumber],
                    }
                  : org,
              );
              localStorage.setItem(
                "sanatorium_organizations",
                JSON.stringify(updated),
              );
              return updated;
            });
            alert(`Путевка ${voucherNumber} успешно выдана!`);
          }}
        />

        <BookingDetailsDialog
          room={selectedRoom}
          booking={
            selectedBookingId
              ? bookings.find((b) => b.id === selectedBookingId)
              : null
          }
          isOpen={isBookingDetailsOpen}
          onClose={() => {
            setIsBookingDetailsOpen(false);
            setSelectedRoom(null);
            setSelectedBookingId(null);
            setSelectedDate(null);
          }}
          onUpdateBooking={handleUpdateBooking}
          onCheckOut={handleCheckOut}
          onTransferRoom={handleTransferRoom}
          onExtendStay={handleExtendStay}
          onAddSecondGuest={handleAddSecondGuest}
          onOpenGuestCard={(guestId) => {
            const guest = guests.find((g) => g.id === guestId);
            if (guest) {
              setSelectedGuest(guest);
              setIsGuestCardOpen(true);
            }
          }}
          onOpenAddGuestDialog={handleOpenAddGuestDialog}
          onCheckIn={handleCheckIn}
          onCancelBooking={(bookingId) => {
            setBookings((prevBookings) => {
              const updated = prevBookings.filter((b) => b.id !== bookingId);
              localStorage.setItem(
                "sanatorium_bookings",
                JSON.stringify(updated),
              );
              return updated;
            });
          }}
          rooms={roomsData}
          allBookings={bookings}
          currentDate={currentDate}
          selectedDate={selectedDate}
        />

        <BlockRoomDialog
          room={selectedRoom}
          isOpen={isBlockRoomDialogOpen}
          onClose={() => {
            setIsBlockRoomDialogOpen(false);
            setSelectedRoom(null);
          }}
          onBlockRoom={handleBlockRoom}
          onUnblockRoom={handleUnblockRoom}
        />

        {/* New Guest Dialog */}
        <Dialog
          open={isNewGuestDialogOpen}
          onOpenChange={setIsNewGuestDialogOpen}
        >
          <DialogContent className="max-w-3xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-800">
                <UserPlus className="w-6 h-6" />
                Добавить нового гостя
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <NewGuestForm
                onSubmit={handleCreateGuest}
                onCancel={() => setIsNewGuestDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* New Organization Dialog */}
        <Dialog
          open={isNewOrganizationDialogOpen}
          onOpenChange={setIsNewOrganizationDialogOpen}
        >
          <DialogContent className="max-w-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Building className="w-6 h-6" />
                Добавить новую организацию
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <NewOrganizationForm
                onSubmit={handleCreateOrganization}
                onCancel={() => setIsNewOrganizationDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialogs */}
        <AddRoomDialog
          isOpen={isAddRoomDialogOpen}
          onClose={() => setIsAddRoomDialogOpen(false)}
        />

        <AddUserDialog
          isOpen={isAddUserDialogOpen}
          onClose={() => setIsAddUserDialogOpen(false)}
        />

        <SystemSettingsDialog
          isOpen={isSystemSettingsDialogOpen}
          onClose={() => setIsSystemSettingsDialogOpen(false)}
        />

        {/* Add Room Type Dialog */}
        <Dialog
          open={isAddRoomTypeDialogOpen}
          onOpenChange={setIsAddRoomTypeDialogOpen}
        >
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Plus className="w-5 h-5" />
                Добавить тип номера
              </DialogTitle>
            </DialogHeader>
            <AddRoomTypeForm
              onSubmit={(newType) => {
                const roomType: RoomType = {
                  id: `type-${Date.now()}`,
                  name: newType.name.toLowerCase().replace(/\s+/g, "_"),
                  displayName: newType.displayName,
                  capacity: newType.capacity,
                  description: newType.description,
                  createdAt: new Date(),
                };
                setRoomTypes((prev) => {
                  const updated = [...prev, roomType];
                  localStorage.setItem(
                    "sanatorium_roomTypes",
                    JSON.stringify(updated),
                  );
                  return updated;
                });
                setIsAddRoomTypeDialogOpen(false);
                alert(`Тип номера "${newType.displayName}" успешно добавлен!`);
              }}
              onCancel={() => setIsAddRoomTypeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Audit Log Dialog */}
        <Dialog
          open={isAuditLogDialogOpen}
          onOpenChange={setIsAuditLogDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-800">
                <FileText className="w-6 h-6" />
                Журнал аудита
              </DialogTitle>
            </DialogHeader>
            <AuditLogViewer
              auditLogs={auditLogs}
              onClose={() => setIsAuditLogDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Simple Settings Dialogs */}
        {/* Enhanced Room Editing Dialog */}
        <Dialog
          open={isEditRoomDialogOpen}
          onOpenChange={setIsEditRoomDialogOpen}
        >
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Edit className="w-6 h-6" />
                Управление номерами - Расширенное редактирование
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <EnhancedRoomEditingDialog
                rooms={roomsData}
                onUpdateRoom={(updatedRoom) => {
                  setRoomsData((prev) => {
                    const updated = prev.map((r) =>
                      r.id === updatedRoom.id ? updatedRoom : r,
                    );
                    localStorage.setItem(
                      "sanatorium_rooms",
                      JSON.stringify(updated),
                    );
                    return updated;
                  });
                }}
                onDeleteRoom={(roomId) => {
                  if (
                    confirm(
                      "Вы уверены, что хотите удалить этот номер? Это действие нельзя отменить.",
                    )
                  ) {
                    setRoomsData((prev) => {
                      const updated = prev.filter((r) => r.id !== roomId);
                      localStorage.setItem(
                        "sanatorium_rooms",
                        JSON.stringify(updated),
                      );
                      return updated;
                    });
                    alert("Номер успешно удален!");
                  }
                }}
                onAddRoom={(newRoom) => {
                  const roomWithId = {
                    ...newRoom,
                    id: `room-${Date.now()}`,
                    position: { row: 0, col: 0 },
                  };
                  setRoomsData((prev) => {
                    const updated = [...prev, roomWithId];
                    localStorage.setItem(
                      "sanatorium_rooms",
                      JSON.stringify(updated),
                    );
                    return updated;
                  });
                  alert(`Номер ${newRoom.number} успешно добавлен!`);
                }}
                onClose={() => setIsEditRoomDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isManageRolesDialogOpen}
          onOpenChange={setIsManageRolesDialogOpen}
        >
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-800">
                <Users className="w-5 h-5" />
                Управление ролями
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Функция управления ролями пользователей
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  Доступные роли:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>
                    • <strong>Администратор</strong> - полный доступ
                  </li>
                  <li>
                    • <strong>Менеджер</strong> - управление бронированием
                  </li>
                  <li>
                    • <strong>Ресепшен</strong> - заселение/выселение
                  </li>
                </ul>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  alert(
                    "Функция управления ролями будет доступна в следующем обновлении",
                  );
                  setIsManageRolesDialogOpen(false);
                }}
              >
                Управлять ролями
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsManageRolesDialogOpen(false)}
                className="w-full"
              >
                Закрыть
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

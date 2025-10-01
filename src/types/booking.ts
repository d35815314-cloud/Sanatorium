export interface Room {
  id: string;
  number: string;
  type:
    | "double"
    | "double_improved"
    | "single"
    | "family"
    | "luxury_double"
    | "single_improved"
    | "luxury"
    | "family_improved";
  floor: number;
  building?: string;
  position: { row: number; col: number };
  capacity: number;
  blocked: boolean;
  blockReason?: string;
  blockedAt?: Date;
  amenities?: string[];
  pricePerNight?: number;
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestAge: number;
  guestAddress: string;
  guestGender: "male" | "female";
  guestPassport?: string;
  checkInDate: Date;
  checkOutDate: Date;
  duration: number; // days
  status: "confirmed" | "booked" | "checked_in" | "completed" | "cancelled";
  actualCheckInAt?: Date;
  actualCheckOutAt?: Date;
  services?: Service[];
  totalAmount?: number;
  voucherNumber?: string;
  organizationId?: string;
  secondGuestId?: string;
  secondGuestName?: string;
  secondGuestGender?: "male" | "female";
  createdAt: Date;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  phone: string;
  email?: string;
  age: number;
  dateOfBirth: Date;
  address: string;
  passportNumber?: string;
  gender: "male" | "female";
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  checkInDate?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category:
    | "medical"
    | "spa"
    | "dining"
    | "entertainment"
    | "transport"
    | "other";
  duration?: number; // minutes
}

export interface Folio {
  id: string;
  bookingId: string;
  guestId: string;
  roomNumber: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  services: FolioService[];
  roomCharges: number;
  serviceCharges: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: "open" | "closed" | "paid";
  createdAt: Date;
}

export interface FolioService {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: Date;
}

export interface BookingOperation {
  id: string;
  type: "early_checkout" | "extend_stay" | "room_transfer";
  roomId: string;
  guestId: string;
  scheduledDate: Date;
  status: "pending" | "completed";
}

export interface DatabaseConnection {
  id: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "administrator" | "manager" | "reception" | "viewer";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// Room status computation types
export type RoomStatus = "free" | "booked" | "occupied" | "blocked";

// Utility function to compute room status
export function computeRoomStatus(
  room: Room,
  date: Date,
  bookings: Booking[],
): RoomStatus {
  // Always check blocked status first - this takes priority
  if (room.blocked) {
    return "blocked";
  }

  // Normalize date to start of day for comparison
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Check for checked-in booking (occupied)
  const occupiedBooking = bookings.find((b) => {
    if (b.roomId !== room.id || b.status !== "checked_in") {
      return false;
    }

    const checkIn = new Date(b.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(b.checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    return checkDate >= checkIn && checkDate < checkOut;
  });

  if (occupiedBooking) {
    return "occupied";
  }

  // Check for booked status - includes current day and future bookings
  const bookedBooking = bookings.find((b) => {
    if (
      b.roomId !== room.id ||
      !(b.status === "booked" || b.status === "confirmed")
    ) {
      return false;
    }

    const checkIn = new Date(b.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(b.checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    // Show as booked if the check date falls within the booking period
    return checkDate >= checkIn && checkDate < checkOut;
  });

  if (bookedBooking) {
    return "booked";
  }

  return "free";
}

export interface AuditLog {
  id: string;
  type: "nightly_audit";
  dateRun: Date;
  actor: string;
  details: string;
  createdAt: Date;
}

export interface RoomType {
  id: string;
  name: string;
  displayName: string;
  capacity: number;
  description?: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  officialName: string;
  unofficialName?: string;
  contactPersonName: string;
  contactPhone: string;
  contractNumber: string;
  issuedVouchers: string[];
  badge?: string;
  badgeColor?: string;
  createdAt: Date;
}

export interface VoucherStatus {
  voucherNumber: string;
  status: "active" | "inactive";
  bookingId?: string;
  guestName?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
}

// Helper function to get voucher status
export function getVoucherStatus(
  voucherNumber: string,
  organizationId: string,
  bookings: Booking[],
): VoucherStatus {
  const voucherBooking = bookings.find(
    (booking) =>
      booking.voucherNumber === voucherNumber &&
      booking.organizationId === organizationId,
  );

  if (!voucherBooking) {
    return {
      voucherNumber,
      status: "inactive",
    };
  }

  const isActive =
    voucherBooking.status === "checked_in" ||
    voucherBooking.status === "booked" ||
    voucherBooking.status === "confirmed";

  return {
    voucherNumber,
    status: isActive ? "active" : "inactive",
    bookingId: voucherBooking.id,
    guestName: voucherBooking.guestName,
    checkInDate: voucherBooking.checkInDate,
    checkOutDate: voucherBooking.checkOutDate,
  };
}

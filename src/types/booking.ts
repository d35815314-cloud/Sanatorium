export interface Room {
  id: string;
  number: string;
  type: "single" | "double" | "double_with_balcony" | "luxury";
  status: "available" | "occupied" | "booked" | "reserved";
  floor: number;
  position: { row: number; col: number };
}

export interface Booking {
  id: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestAge: number;
  guestAddress: string;
  checkInDate: Date;
  checkOutDate: Date;
  duration: number; // days
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
}

export interface Guest {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  address: string;
  checkInDate?: Date;
}

export interface BookingOperation {
  id: string;
  type: "early_checkout" | "extend_stay" | "room_transfer";
  roomId: string;
  guestId: string;
  scheduledDate: Date;
  status: "pending" | "completed";
}

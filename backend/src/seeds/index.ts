import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";
import { Room, RoomType, RoomStatus } from "../entities/Room";
import { Guest } from "../entities/Guest";
import { Booking, BookingStatus } from "../entities/Booking";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected for seeding");

    // Clear existing data in correct order (respecting foreign key constraints)
    console.log("Clearing existing data...");
    await AppDataSource.query('TRUNCATE TABLE "audit_logs" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "bookings" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "guests" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "rooms" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "users" CASCADE');

    // Seed Users
    console.log("Seeding users...");
    const userRepository = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      {
        email: "admin@sanatorium.com",
        password: hashedPassword,
        firstName: "Администратор",
        lastName: "Системы",
        role: UserRole.ADMINISTRATOR,
      },
      {
        email: "manager@sanatorium.com",
        password: hashedPassword,
        firstName: "Менеджер",
        lastName: "Главный",
        role: UserRole.MANAGER,
      },
      {
        email: "reception1@sanatorium.com",
        password: hashedPassword,
        firstName: "Анна",
        lastName: "Петрова",
        role: UserRole.RECEPTION,
      },
      {
        email: "reception2@sanatorium.com",
        password: hashedPassword,
        firstName: "Мария",
        lastName: "Иванова",
        role: UserRole.RECEPTION,
      },
    ];

    const savedUsers = [];
    for (const userData of users) {
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);
      savedUsers.push(savedUser);
    }
    console.log(`✓ ${savedUsers.length} users seeded successfully`);

    // Seed Rooms based on sanatorium floor plan
    console.log("Seeding rooms...");
    const roomRepository = AppDataSource.getRepository(Room);
    const rooms = [];

    // Building A rooms
    const buildingARooms = [
      // 1st floor
      {
        number: "A101",
        type: RoomType.SINGLE,
        building: "A",
        floor: 1,
        capacity: 1,
        price: 2500,
        amenities: ["WiFi", "TV", "Кондиционер"],
      },
      {
        number: "A103",
        type: RoomType.SINGLE,
        building: "A",
        floor: 1,
        capacity: 1,
        price: 2500,
        amenities: ["WiFi", "TV", "Кондиционер"],
      },
      {
        number: "A105",
        type: RoomType.DOUBLE,
        building: "A",
        floor: 1,
        capacity: 2,
        price: 3500,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар"],
      },
      {
        number: "A107",
        type: RoomType.DOUBLE,
        building: "A",
        floor: 1,
        capacity: 2,
        price: 3500,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар"],
      },
      {
        number: "A109",
        type: RoomType.DOUBLE_WITH_BALCONY,
        building: "A",
        floor: 1,
        capacity: 2,
        price: 4000,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар", "Балкон"],
      },
      {
        number: "A111",
        type: RoomType.FAMILY,
        building: "A",
        floor: 1,
        capacity: 4,
        price: 5500,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар", "Диван-кровать"],
      },

      // 2nd floor
      {
        number: "A201",
        type: RoomType.SINGLE,
        building: "A",
        floor: 2,
        capacity: 1,
        price: 2700,
        amenities: ["WiFi", "TV", "Кондиционер", "Вид на горы"],
      },
      {
        number: "A203",
        type: RoomType.SINGLE,
        building: "A",
        floor: 2,
        capacity: 1,
        price: 2700,
        amenities: ["WiFi", "TV", "Кондиционер", "Вид на горы"],
      },
      {
        number: "A205",
        type: RoomType.DOUBLE,
        building: "A",
        floor: 2,
        capacity: 2,
        price: 3700,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар", "Вид на горы"],
      },
      {
        number: "A207",
        type: RoomType.DOUBLE_WITH_BALCONY,
        building: "A",
        floor: 2,
        capacity: 2,
        price: 4200,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Балкон",
          "Вид на горы",
        ],
      },
      {
        number: "A209",
        type: RoomType.LUXURY,
        building: "A",
        floor: 2,
        capacity: 2,
        price: 6500,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Балкон",
          "Джакузи",
          "Вид на горы",
        ],
      },
      {
        number: "A211",
        type: RoomType.FAMILY,
        building: "A",
        floor: 2,
        capacity: 4,
        price: 5800,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Диван-кровать",
          "Вид на горы",
        ],
      },

      // 3rd floor
      {
        number: "A301",
        type: RoomType.LUXURY,
        building: "A",
        floor: 3,
        capacity: 2,
        price: 7000,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Балкон",
          "Джакузи",
          "Панорамный вид",
        ],
      },
      {
        number: "A303",
        type: RoomType.LUXURY_2X,
        building: "A",
        floor: 3,
        capacity: 4,
        price: 9500,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Балкон",
          "Джакузи",
          "Сауна",
          "Панорамный вид",
        ],
      },
      {
        number: "A305",
        type: RoomType.LUXURY,
        building: "A",
        floor: 3,
        capacity: 2,
        price: 7000,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Балкон",
          "Джакузи",
          "Панорамный вид",
        ],
      },
    ];

    // Building B rooms
    const buildingBRooms = [
      // 1st floor
      {
        number: "B101",
        type: RoomType.SINGLE,
        building: "B",
        floor: 1,
        capacity: 1,
        price: 2400,
        amenities: ["WiFi", "TV"],
      },
      {
        number: "B103",
        type: RoomType.SINGLE,
        building: "B",
        floor: 1,
        capacity: 1,
        price: 2400,
        amenities: ["WiFi", "TV"],
      },
      {
        number: "B105",
        type: RoomType.DOUBLE,
        building: "B",
        floor: 1,
        capacity: 2,
        price: 3300,
        amenities: ["WiFi", "TV", "Кондиционер"],
      },
      {
        number: "B107",
        type: RoomType.DOUBLE,
        building: "B",
        floor: 1,
        capacity: 2,
        price: 3300,
        amenities: ["WiFi", "TV", "Кондиционер"],
      },
      {
        number: "B109",
        type: RoomType.DOUBLE_WITH_BALCONY,
        building: "B",
        floor: 1,
        capacity: 2,
        price: 3800,
        amenities: ["WiFi", "TV", "Кондиционер", "Балкон"],
      },
      {
        number: "B111",
        type: RoomType.FAMILY,
        building: "B",
        floor: 1,
        capacity: 4,
        price: 5200,
        amenities: ["WiFi", "TV", "Кондиционер", "Диван-кровать"],
      },

      // 2nd floor
      {
        number: "B201",
        type: RoomType.SINGLE,
        building: "B",
        floor: 2,
        capacity: 1,
        price: 2600,
        amenities: ["WiFi", "TV", "Кондиционер"],
      },
      {
        number: "B203",
        type: RoomType.DOUBLE,
        building: "B",
        floor: 2,
        capacity: 2,
        price: 3500,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар"],
      },
      {
        number: "B205",
        type: RoomType.DOUBLE_WITH_BALCONY,
        building: "B",
        floor: 2,
        capacity: 2,
        price: 4000,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар", "Балкон"],
      },
      {
        number: "B207",
        type: RoomType.FAMILY,
        building: "B",
        floor: 2,
        capacity: 4,
        price: 5500,
        amenities: ["WiFi", "TV", "Кондиционер", "Мини-бар", "Диван-кровать"],
      },
      {
        number: "B209",
        type: RoomType.LUXURY,
        building: "B",
        floor: 2,
        capacity: 2,
        price: 6200,
        amenities: [
          "WiFi",
          "TV",
          "Кондиционер",
          "Мини-бар",
          "Балкон",
          "Джакузи",
        ],
      },
    ];

    const allRooms = [...buildingARooms, ...buildingBRooms];
    const savedRooms = [];

    for (const roomData of allRooms) {
      const room = roomRepository.create({
        ...roomData,
        pricePerNight: roomData.price,
        status: RoomStatus.AVAILABLE,
        description: `${roomData.type} комната в корпусе ${roomData.building}, ${roomData.floor} этаж`,
      });
      const savedRoom = await roomRepository.save(room);
      savedRooms.push(savedRoom);
    }
    console.log(`✓ ${savedRooms.length} rooms seeded successfully`);

    // Seed Guests
    console.log("Seeding guests...");
    const guestRepository = AppDataSource.getRepository(Guest);
    const guests = [
      {
        firstName: "Иван",
        lastName: "Петров",
        middleName: "Александрович",
        passportNumber: "1234567890",
        phone: "+7-900-123-45-67",
        email: "ivan.petrov@email.com",
        dateOfBirth: new Date("1985-03-15"),
        address: "г. Москва, ул. Ленина, д. 10, кв. 5",
        emergencyContact: "Петрова Мария Ивановна",
        emergencyPhone: "+7-900-123-45-68",
        notes: "Аллергия на орехи",
      },
      {
        firstName: "Мария",
        lastName: "Сидорова",
        middleName: "Викторовна",
        passportNumber: "2345678901",
        phone: "+7-900-234-56-78",
        email: "maria.sidorova@email.com",
        dateOfBirth: new Date("1990-07-22"),
        address: "г. Санкт-Петербург, пр. Невский, д. 25, кв. 12",
        emergencyContact: "Сидоров Виктор Петрович",
        emergencyPhone: "+7-900-234-56-79",
      },
      {
        firstName: "Александр",
        lastName: "Козлов",
        middleName: "Сергеевич",
        passportNumber: "3456789012",
        phone: "+7-900-345-67-89",
        email: "alex.kozlov@email.com",
        dateOfBirth: new Date("1978-11-08"),
        address: "г. Екатеринбург, ул. Малышева, д. 33, кв. 7",
        emergencyContact: "Козлова Елена Михайловна",
        emergencyPhone: "+7-900-345-67-90",
        notes: "Диабетик, требует специальное питание",
      },
      {
        firstName: "Елена",
        lastName: "Волкова",
        middleName: "Андреевна",
        passportNumber: "4567890123",
        phone: "+7-900-456-78-90",
        email: "elena.volkova@email.com",
        dateOfBirth: new Date("1982-05-30"),
        address: "г. Новосибирск, ул. Красный проспект, д. 15, кв. 22",
      },
      {
        firstName: "Дмитрий",
        lastName: "Морозов",
        middleName: "Владимирович",
        passportNumber: "5678901234",
        phone: "+7-900-567-89-01",
        email: "dmitry.morozov@email.com",
        dateOfBirth: new Date("1975-12-03"),
        address: "г. Казань, ул. Баумана, д. 8, кв. 15",
        emergencyContact: "Морозова Ольга Николаевна",
        emergencyPhone: "+7-900-567-89-02",
      },
      {
        firstName: "Ольга",
        lastName: "Лебедева",
        middleName: "Игоревна",
        passportNumber: "6789012345",
        phone: "+7-900-678-90-12",
        email: "olga.lebedeva@email.com",
        dateOfBirth: new Date("1988-09-17"),
        address: "г. Ростов-на-Дону, ул. Пушкинская, д. 42, кв. 8",
      },
    ];

    const savedGuests = [];
    for (const guestData of guests) {
      const guest = guestRepository.create(guestData);
      const savedGuest = await guestRepository.save(guest);
      savedGuests.push(savedGuest);
    }
    console.log(`✓ ${savedGuests.length} guests seeded successfully`);

    // Seed Bookings
    console.log("Seeding bookings...");
    const bookingRepository = AppDataSource.getRepository(Booking);
    const today = new Date();
    const bookings = [
      {
        roomId: savedRooms[0].id, // A101
        guestId: savedGuests[0].id, // Иван Петров
        checkInDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        checkOutDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        numberOfNights: 5,
        numberOfGuests: 1,
        totalAmount: 12500, // 5 nights * 2500
        paidAmount: 12500,
        status: BookingStatus.CHECKED_IN,
        notes: "Раннее заселение",
        specialRequests: "Номер на верхнем этаже",
      },
      {
        roomId: savedRooms[4].id, // A109 - Double with balcony
        guestId: savedGuests[1].id, // Мария Сидорова
        checkInDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        checkOutDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        numberOfNights: 7,
        numberOfGuests: 2,
        totalAmount: 28000, // 7 nights * 4000
        paidAmount: 14000, // 50% paid
        status: BookingStatus.CONFIRMED,
        notes: "Медовый месяц",
        specialRequests: "Украшение номера цветами",
      },
      {
        roomId: savedRooms[10].id, // A209 - Luxury
        guestId: savedGuests[2].id, // Александр Козлов
        checkInDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        checkOutDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        numberOfNights: 7,
        numberOfGuests: 1,
        totalAmount: 45500, // 7 nights * 6500
        paidAmount: 0,
        status: BookingStatus.PENDING,
        notes: "VIP клиент",
        specialRequests: "Трансфер из аэропорта",
      },
      {
        roomId: savedRooms[5].id, // A111 - Family
        guestId: savedGuests[3].id, // Елена Волкова
        checkInDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        checkOutDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        numberOfNights: 7,
        numberOfGuests: 3,
        totalAmount: 38500, // 7 nights * 5500
        paidAmount: 38500,
        status: BookingStatus.CHECKED_OUT,
        notes: "Семейный отдых",
        specialRequests: "Детская кроватка",
      },
      {
        roomId: savedRooms[20].id, // B205 - Double with balcony
        guestId: savedGuests[4].id, // Дмитрий Морозов
        checkInDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        checkOutDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        numberOfNights: 5,
        numberOfGuests: 2,
        totalAmount: 20000, // 5 nights * 4000
        paidAmount: 5000, // 25% paid
        status: BookingStatus.CONFIRMED,
        notes: "Корпоративное бронирование",
      },
      {
        roomId: savedRooms[2].id, // A105 - Double
        guestId: savedGuests[5].id, // Ольга Лебедева
        checkInDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        checkOutDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        numberOfNights: 3,
        numberOfGuests: 1,
        totalAmount: 10500, // 3 nights * 3500
        paidAmount: 10500,
        status: BookingStatus.CANCELLED,
        notes: "Отменено по семейным обстоятельствам",
      },
    ];

    const savedBookings = [];
    for (const bookingData of bookings) {
      const booking = bookingRepository.create(bookingData);
      const savedBooking = await bookingRepository.save(booking);
      savedBookings.push(savedBooking);
    }
    console.log(`✓ ${savedBookings.length} bookings seeded successfully`);

    // Update room statuses based on bookings
    console.log("Updating room statuses...");
    for (const booking of savedBookings) {
      if (booking.status === BookingStatus.CHECKED_IN) {
        const room = savedRooms.find((r) => r.id === booking.roomId);
        if (room) {
          room.status = RoomStatus.OCCUPIED;
          await roomRepository.save(room);
        }
      } else if (
        booking.status === BookingStatus.CONFIRMED &&
        booking.checkInDate <=
          new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      ) {
        const room = savedRooms.find((r) => r.id === booking.roomId);
        if (room) {
          room.status = RoomStatus.BOOKED;
          await roomRepository.save(room);
        }
      }
    }

    // Set some rooms to maintenance status
    const maintenanceRooms = [savedRooms[15], savedRooms[25]];
    for (const room of maintenanceRooms) {
      room.status = RoomStatus.MAINTENANCE;
      await roomRepository.save(room);
    }
    console.log(`✓ Room statuses updated`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Seeding Summary:");
    console.log(`   Users: ${savedUsers.length}`);
    console.log(`   Rooms: ${savedRooms.length}`);
    console.log(`   Guests: ${savedGuests.length}`);
    console.log(`   Bookings: ${savedBookings.length}`);
    console.log("\n🔐 Default Login Credentials:");
    console.log(`   Admin: admin@sanatorium.com / password123`);
    console.log(`   Manager: manager@sanatorium.com / password123`);
    console.log(`   Reception: reception1@sanatorium.com / password123`);
    console.log(`   Reception: reception2@sanatorium.com / password123`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n🔌 Database connection closed");
    }
  }
};

// Run the seeding function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("\n✅ Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Seeding process failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;

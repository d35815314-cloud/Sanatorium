# 🏥 Sanatorium Management System

A comprehensive full-stack application for managing sanatorium operations including room management, guest registration, booking system, and reporting.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Administrator, Manager, Reception)
- Secure API endpoints with middleware protection

### 🏨 Room Management
- Room creation, editing, and deletion
- Multiple room categories (Single, Double, Double with Balcony, Family, Luxury)
- Building and floor organization
- Real-time room status tracking (Available, Occupied, Booked, Reserved, Maintenance)
- Capacity and pricing management

### 👥 Guest Management
- Guest registration with passport and contact details
- Guest history tracking
- Search functionality by name, phone, or passport
- Emergency contact information

### 📅 Booking System
- Create, edit, extend, and cancel bookings
- Interactive calendar view for availability
- Grid view for room layout visualization
- Automatic status updates
- Special requests and notes

### 📊 Reporting & Analytics
- Occupancy reports by date range
- Revenue analytics with breakdowns
- Guest statistics and repeat customer tracking
- Audit logs for all system actions
- Export functionality (CSV)

## 🛠 Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **TypeORM** - ORM with migrations
- **JWT** - Authentication
- **Swagger** - API documentation
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **ShadCN/UI** - UI components

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** - Reverse proxy
- **PostgreSQL** - Containerized database

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running locally)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sanatorium-management
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start PostgreSQL** (if not using Docker)
   ```bash
   # Using Docker for just the database
   docker run --name postgres -e POSTGRES_DB=sanatorium_db -e POSTGRES_USER=sanatorium -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
   ```

5. **Run migrations and seed data**
   ```bash
   npm run migration:run
   npm run seed
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔑 Default Login Credentials

After seeding the database, you can use these credentials:

- **Administrator**: `admin@sanatorium.com` / `password123`
- **Manager**: `manager@sanatorium.com` / `password123`
- **Reception**: `reception1@sanatorium.com` / `password123`
- **Reception**: `reception2@sanatorium.com` / `password123`

## 📚 API Documentation

Once the backend is running, visit http://localhost:3001/api-docs for interactive Swagger documentation.

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `GET /api/rooms/availability` - Check availability

#### Guests
- `GET /api/guests` - List all guests
- `POST /api/guests` - Create new guest
- `GET /api/guests/:id` - Get guest details
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

#### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## 🏗 Project Structure

```
sanatorium-management/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── entities/       # TypeORM entities
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── seeds/          # Database seeding
│   │   └── server.ts       # Main server file
│   ├── Dockerfile
│   └── package.json
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── data/              # Static data
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── docker-compose.yml      # Docker services
├── nginx.conf             # Nginx configuration
└── README.md
```

## 🔧 Development

### Database Migrations

```bash
# Generate new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Seeding Data

```bash
# Seed the database with test data
cd backend
npm run seed
```

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ..
npm run build
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Run database migrations in container
docker-compose exec backend npm run migration:run

# Seed database in container
docker-compose exec backend npm run seed
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention with TypeORM
- Audit logging for all actions

## 📈 Monitoring & Logging

- Request logging middleware
- Error handling with stack traces in development
- Audit logs for user actions
- Health check endpoints
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ for efficient sanatorium management**

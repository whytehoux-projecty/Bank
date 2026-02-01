# Staff Portal Backend

Backend API server for the Staff Portal application.

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed the database with default data
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The API will be available at `http://localhost:3000`.

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## Docker

### Using Docker Compose (Recommended)

```bash
cd docker
docker-compose up --build
```

This starts:

- API server on port 3000
- PostgreSQL on port 5432
- Redis on port 6379

## API Endpoints

### Health Check

- `GET /health` - Returns server status

### CMS (Content Management System)

**Public Endpoints:**

- `GET /api/v1/cms/settings` - Get all public settings
- `GET /api/v1/cms/settings/:category` - Get settings by category (branding, login, dashboard, footer)

**Admin Endpoints (require authentication):**

- `GET /api/v1/cms/admin/settings` - Get all settings with metadata
- `PUT /api/v1/cms/admin/settings` - Bulk update settings
- `PUT /api/v1/cms/admin/settings/:key` - Update single setting
- `POST /api/v1/cms/admin/upload/logo` - Upload organization logo
- `POST /api/v1/cms/admin/upload/background` - Upload login background

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration (database, etc.)
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication & Authorization ✅
│   │   ├── staff/        # Staff management ✅
│   │   ├── finance/      # Finance/payroll ✅
│   │   ├── applications/ # Leave/transfer apps ✅
│   │   ├── admin/        # Admin dashboard & stats ✅
│   │   └── cms/          # Content Management ✅
│   ├── shared/           # Shared utilities
│   │   ├── middleware/   # Express middleware (Auth, Rate Limit, Error)
│   │   ├── utils/        # Helper functions (Storage, JWT)
│   │   └── types/        # TypeScript declarations
│   ├── app.ts            # Express app setup
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
└── tests/                # Test files (TODO)
```

## Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/staff_portal"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
```

## Default Admin Credentials

After running the seed script:

- **Staff ID**: `ADMIN-001`
- **Password**: `Admin@123456`

⚠️ **Change these in production!**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with defaults |

## License

ISC

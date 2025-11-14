# Exness Trading Platform

A cryptocurrency trading platform with real-time price updates, authentication, and trading capabilities. The platform supports trading of BTC, ETH, and SOL with leverage, margin, and slippage controls.

## 🏗️ Architecture

The platform is built as a microservices architecture with four main components:

- **`api-backend`** - Express.js API server (Bun runtime) handling authentication, trading operations, and balance management
- **`frontend`** - Next.js 14 frontend application with TypeScript and Tailwind CSS
- **`engine`** - Trading engine service that processes orders and manages trading logic
- **`price-poller`** - Real-time price polling service that connects to Backpack Exchange WebSocket and publishes prices to Redis

## 🛠️ Technologies

### Backend

- **Runtime**: Bun
- **Framework**: Express.js
- **Database/Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: SendGrid

### Frontend

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Services

- **WebSocket**: ws (for price polling)
- **Redis**: ioredis, redis (for pub/sub and data storage)


## 🚀 Getting Started

### Prerequisites

- **Bun** (latest version) or **Node.js**
- **Redis** server running locally or accessible
- **SendGrid API Key** (for email authentication)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd exness-v1
   ```

2. **Install dependencies for each service**

   ```bash
   # API Backend
   cd api-backend
   bun install

   # Frontend
   cd ../frontend
   npm install

   # Engine
   cd ../engine
   bun install

   # Price Poller
   cd ../price-poller
   bun install
   ```

3. **Set up environment variables**

   Create `.env` files in each service directory:

   **`api-backend/.env`**:

   ```env
   JWT_SECRET=your-secret-key
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=your-email@example.com
   ```

   **`frontend/.env.local`** (if needed):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. **Start Redis**
   ```bash
   redis-server
   ```

### Running the Services

Run each service in a separate terminal:

1. **Start Price Poller** (must run first for price data)

   ```bash
   cd price-poller
   bun run dev
   ```

2. **Start Trading Engine**

   ```bash
   cd engine
   bun run src/index.ts
   ```

3. **Start API Backend**

   ```bash
   cd api-backend
   bun run dev
   ```

   Server runs on `http://localhost:4000`

4. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/v1/signup` - Register new user (sends magic link email)
- `POST /api/v1/signin` - Sign in user (sends magic link email)
- `GET /api/v1/verify?token=<token>` - Verify magic link token and set cookie

### Assets

- `GET /api/v1/supportedAssets` - Get list of supported trading assets (BTC, ETH, SOL)

### Trading (Protected - requires authentication)

- `POST /api/v1/trades/create` - Create a new trade order
  ```json
  {
    "asset": "BTC" | "ETH" | "SOL",
    "type": "long" | "short",
    "margin": number,
    "leverage": number,
    "slippage": number
  }
  ```
- `POST /api/v1/trades/close` - Close an existing trade order
  ```json
  {
    "orderId": "uuid"
  }
  ```

### Balance (Protected - requires authentication)

- `GET /api/v1/balance` - Get all asset balances for authenticated user
- `GET /api/v1/balance/:asset` - Get balance for specific asset (BTC, ETH, SOL)

## 🔐 Authentication

The platform uses **magic link authentication**:

1. User provides email address
2. System sends a magic link via SendGrid email
3. User clicks the link to verify and authenticate
4. JWT token is stored in HTTP-only cookie

All protected routes require a valid JWT token in the cookie.

## 💱 Supported Assets

- **BTC** (Bitcoin)
- **ETH** (Ethereum)
- **SOL** (Solana)

Prices are fetched in real-time from Backpack Exchange WebSocket API and published to Redis Streams.

## 🔄 Data Flow

1. **Price Updates**: Price poller connects to Backpack Exchange WebSocket and publishes price updates to Redis Stream (`latest-prices`)
2. **Order Processing**: API receives trade orders → publishes to Redis queue → Engine processes orders
3. **Balance Management**: Balance requests are processed through Redis pub/sub pattern
4. **Real-time Updates**: Frontend can subscribe to price updates and order status changes

## 📝 Development

### Scripts

**API Backend**:

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run build` - Build TypeScript

**Frontend**:

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Price Poller**:

- `bun run dev` - Start with hot reload
- `bun run start` - Start production

## 🔧 Configuration

- **API Port**: 4000 (configurable in `api-backend/src/server.ts`)
- **Frontend Port**: 3000 (Next.js default)
- **Redis**: Default connection (localhost:6379)
- **Price Update Interval**: 100ms (configurable in `price-poller/src/index.ts`)

## 📄 License

Private project

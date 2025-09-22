# Exness Clone Frontend

A Next.js frontend for the Exness trading platform clone.

## Features

- **Authentication**: Magic link authentication via email
- **Dashboard**: View balances for BTC, ETH, and SOL
- **Trading**: Open long/short positions with leverage
- **Positions**: Manage and close open positions

## Getting Started

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── trade/             # Trading page
│   └── positions/         # Positions management
├── components/            # Reusable React components
├── contexts/              # React contexts (Auth)
├── lib/                   # API client and utilities
└── public/                # Static assets
```

## API Integration

The frontend connects to the backend API running on `http://localhost:4000`. Make sure the backend server is running before starting the frontend.

## Environment Variables

No environment variables are required for the frontend. The API base URL is hardcoded to `http://localhost:4000` in `lib/api.ts`.


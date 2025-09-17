export type OpenOrder = {
  openPrice: number;
  qty: number;
  type: "long" | "short";
  margin: number;
  leverage: number;
  slippage: number;
  asset: "BTC" | "ETH" | "SOL";
  userId: string;
  closePrice?: number;
  pnl: number;
  status: "open" | "closed" | "liquidated";
};

export type AssetBalance = {
  balance: number;
  decimals: number;
};

export type BalanceAssets = "USD" | "ETH" | "BTC" | "SOL";

export type OrderQueue = {
  mode: string;
  asset: "BTC" | "ETH" | "SOL";
  orderId: string;
  userId: string;
  type: "long" | "short";
  margin: number;
  leverage: number;
  slippage: number;
};

export type SnapShot = {
  timestamp: number;
  offset_id: string;
  open_orders: Record<string, OpenOrder>;
  user_balances: Record<string, Record<BalanceAssets, AssetBalance>>;
};

export type SnapshotMetadata = {
  latestSnapshotId: string;
  lastSnapshotTime: number;
  latestSnapshotOffsetId: string;
};

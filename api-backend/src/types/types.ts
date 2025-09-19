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

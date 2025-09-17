import Redis from "ioredis";
import { OpenOrders } from "./services/popData";

type Trade = {
  price: number;
  decimal: number;
};

export type PPTrade = {
  asset: string;
  price: number;
  decimal: number;
};

export const PRICES: Record<string, Trade> = {};

const PriceClient = new Redis();

export async function getLatestPrices() {
  while (true) {
    const stream = await PriceClient.xread(
      "BLOCK",
      0,
      "STREAMS",
      "latest-prices",
      "$"
    );

    if (!stream) continue;

    const [streamName, message] = stream[0] as any;
    for (const [id, data] of message) {
      const [name, rawPrices] = data;
      const trades: PPTrade[] = JSON.parse(rawPrices).price_updates;

      trades.map((trade) => {
        PRICES[trade.asset] = {
          price: trade.price,
          decimal: trade.decimal,
        };
      });

      Object.entries(OpenOrders).forEach(([orderID, order]) => {
        let pnl = 0;
        if (order.type == "long") {
          pnl = (PRICES[order.asset]!.price - order.openPrice) * order.qty;
        } else {
          pnl = (order.openPrice - PRICES[order.asset]!.price) * order.qty;
        }

        order.pnl = Math.trunc(pnl);
        order.closePrice = PRICES[order.asset]!.price;
      });
    }
  }
}

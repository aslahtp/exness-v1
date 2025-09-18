import { createClient } from "redis";
import type {
  AssetBalance,
  BalanceAssets,
  OpenOrder,
  OrderQueue,
} from "../types/types";
import { PRICES } from "../getPrices";
import { SnapshotService } from "./snapshot";

const client = createClient();

client.connect();

export const OpenOrders: Record<string, OpenOrder> = {};
export const USER_BALANCES: Record<
  string,
  Record<BalanceAssets, AssetBalance>
> = {};
let lastId = "$";

async function initializeFromSnapshot() {
  const { snapshot, snapshotId } = await SnapshotService.loadLatestSnapshot();

  if (snapshot) {
    Object.assign(OpenOrders, snapshot.open_orders);
    Object.assign(USER_BALANCES, snapshot.user_balances);
    lastId = snapshot.offset_id ? snapshot.offset_id : "$";
    console.log("Snapshot restored successfully");
  } else {
    console.log("No snapshots found");
  }
}

client.on("connect", async () => {
  await initializeFromSnapshot();
  while (1) {
    const response = await client.xRead(
      {
        key: "trade-stream",
        id: lastId,
      },
      {
        BLOCK: 0,
      }
    );

    if (!response || !Array.isArray(response)) continue;

    const streamData = response[0] as { name: string; messages: any[] };
    const { name: streamName, messages } = streamData;

    lastId = messages[0].id;

    const Data: any = JSON.parse(messages[0].message.message);

    if (Data.mode == "create-order") {
      const orderData = Data as OrderQueue;
      const price = PRICES[orderData.asset]!.price;

      const qty = (orderData.margin * orderData.leverage) / price;

      OpenOrders[orderData.orderId] = {
        openPrice: price,
        qty: qty,
        type: orderData.type,
        margin: orderData.margin,
        leverage: orderData.leverage,
        slippage: orderData.slippage,
        asset: orderData.asset,
        userId: orderData.userId,
        status: "open",
        pnl: 0,
      };
      console.log("Received order ", OpenOrders[orderData.orderId]);

      USER_BALANCES[orderData.userId]![orderData.asset].balance += qty;

      client.xAdd("callback-queue", "*", {
        id: orderData.orderId,
        data: orderData.orderId,
      });

      console.log("Order ID sent back");
    } else if (Data.mode == "balance") {
      const { id, userId } = Data;

      console.log("received balance request of id :", userId);

      if (!USER_BALANCES[userId]) {
        console.log("Creating balance for user:", userId);
        USER_BALANCES[userId] = {
          USD: {
            balance: 500000,
            decimals: 2,
          },
          BTC: {
            balance: 0,
            decimals: 4,
          },
          ETH: {
            balance: 0,
            decimals: 6,
          },
          SOL: {
            balance: 0,
            decimals: 6,
          },
        };
        console.log("User balance created ", USER_BALANCES);
      }

      client.xAdd("callback-queue", "*", {
        id: id,
        data: JSON.stringify(USER_BALANCES[userId]),
      });
    } else if (Data.mode == "close") {
      const { id, OrderId } = Data;

      console.log("Received order close request for order ", OrderId);

      const order = OpenOrders[OrderId];

      if (!order) return;

      const pnl = order.pnl;

      console.log("The PNL is ", pnl);

      order.status = "closed";

      USER_BALANCES[order.userId]!.USD.balance +=
        pnl /
        10 **
          (PRICES[order.asset]!.decimal -
            USER_BALANCES[order.userId]!.USD.decimals);

      USER_BALANCES[order.userId]![order.asset].balance -= order.qty;

      const balance = USER_BALANCES[order.userId]!.USD.balance;

      console.log("Order closed successfully", order);

      client.xAdd("callback-queue", "*", {
        id: id,
        data: JSON.stringify({ balance }),
      });
      console.log("Balance sent back");
    }
  }
});

setInterval(() => {
  SnapshotService.saveSnapshot(OpenOrders, USER_BALANCES, lastId);
}, 10000);

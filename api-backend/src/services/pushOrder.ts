import type { OrderQueue } from "../types/types";

import { client } from "../server";

export const TRADE_QUEUE = "trade-stream";

export async function pushOrder(data: OrderQueue) {
  try {
    console.log("sending message to the queue");

    await client.xAdd(TRADE_QUEUE, "*", {
      message: JSON.stringify(data),
    });

    console.log("pushed data to queue");
  } catch (e) {
    console.log(e);
  }
}

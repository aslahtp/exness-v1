import { client } from "../server";
import { TRADE_QUEUE } from "./pushOrder";

export async function closeOrder(id: string, OrderId: string) {
  try {
    console.log("CLose request sending to the queue");

    await client.xAdd(TRADE_QUEUE, "*", {
      message: JSON.stringify({
        mode: "close",
        id: id,
        OrderId: OrderId,
      }),
    });

    console.log("close request sent to the queue");
  } catch (e) {
    console.log("error closing order", e);
  }
}

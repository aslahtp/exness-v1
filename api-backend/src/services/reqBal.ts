import { client } from "../server";
import { TRADE_QUEUE } from "./pushOrder";

export async function reqBalance(id: string, userId: string) {
  try {
    console.log("balance request sending to queue");

    await client.xAdd(TRADE_QUEUE, "*", {
      message: JSON.stringify({
        mode: "balance",
        id: id,
        userId: userId,
      }),
    });

    console.log("balance request sent to queue");
  } catch (e) {
    console.log("error sending the balance request to the queue");
  }
}

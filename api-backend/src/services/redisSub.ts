import { createClient, type RedisClientType } from "redis";

export const CALLBACK_QUEUE = "callback-queue";

export class RedisSubscriber {
  private client: RedisClientType;
  private callbacks: Record<string, (value?: any) => void>;

  constructor() {
    this.client = createClient();
    this.client.connect();
    this.callbacks = {};

    this.client.on("connect", () => {
      this.runLoop();
    });
  }

  async runLoop() {
    while (1) {
      const response = await this.client.xRead(
        {
          key: CALLBACK_QUEUE,
          id: "$",
        },
        {
          COUNT: 1,
          BLOCK: 0,
        }
      );

      if (!response || !Array.isArray(response)) continue;

      const streamData = response[0] as { name: string; messages: any[] };
      const { name: streamName, messages } = streamData;

      const id = messages[0].message.id;

      console.log("Received callback for order:", id);

      const data = messages[0].message.data;

      this.callbacks[id]!(data);
    }
  }

  waitForMeassage(callBackId: string) {
    return new Promise((resolve, reject) => {
      this.callbacks[callBackId] = resolve;
    });
  }
}

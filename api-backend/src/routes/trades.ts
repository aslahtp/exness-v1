import { Router, type Request } from "express";
import { v4 as uuidv4 } from "uuid";
import type { OrderQueue } from "../types/types"
import { pushOrder } from "../services/pushOrder";
import {closeOrder} from '../services/closeOrder'
import { RedisSubscriber } from "../services/redisSub";

const router = Router();

type TradeCreateReq = {
  asset: "BTC" | "ETH" | "SOL";
  type: "long" | "short";
  margin: number;
  leverage: number;
  slippage: number;
};

export const redisSubscriber = new RedisSubscriber()

router.post(
  "/create",
  async (req: Request<{}, {}, TradeCreateReq, {}>, res) => {
    const TradeOptions = req.body;
    const id = (req as any).id;

    const orderId = uuidv4();

    const OrderQueueItem: OrderQueue = {
      mode:"create-order",
      asset: TradeOptions.asset,
      orderId: orderId,
      userId: id,
      type: TradeOptions.type,
      margin: TradeOptions.margin,
      leverage: TradeOptions.leverage,
      slippage: TradeOptions.slippage,
    };

    
    await pushOrder(OrderQueueItem)

    const orderIdRes = await redisSubscriber.waitForMeassage(orderId)

    res.json({orderId:orderIdRes})
    
  }
);

router.post('/close',async (req,res)=>{
  const{ orderId  }   = req.body

  const id = uuidv4()

  await closeOrder(id,orderId)

  const data = await redisSubscriber.waitForMeassage(id) as string

  res.json(JSON.parse(data))

})

export default router;

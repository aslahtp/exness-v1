import { Router } from "express";
import { reqBalance } from "../services/reqBal";
import { redisSubscriber } from "./trades";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req as any).id;
  //console.log(userId);
  const id = uuidv4();
  await reqBalance(id, userId);
  const balanceRes = (await redisSubscriber.waitForMeassage(id)) as string;
  res.json(JSON.parse(balanceRes));
});

router.get("/:asset", async (req, res) => {
  const asset = req.params.asset;
  const userId = (req as any).id;
  console.log(userId);
  const id = uuidv4();
  await reqBalance(id, userId);
  const balanceRes = (await redisSubscriber.waitForMeassage(id)) as string;
  const balance = JSON.parse(balanceRes);
  const assetBalance = balance[asset];
  res.json({
    [asset]: assetBalance,
  });
});

export default router;

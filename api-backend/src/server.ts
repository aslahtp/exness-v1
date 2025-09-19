import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import sgMail from "@sendgrid/mail";
import { verifyToken } from "./utils/jwt";
import { createClient } from "redis";

export const client = createClient();
client.connect();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET!;

const app = express();

app.use(express.json());

app.use("/assets", express.static("assets"));

app.get("/", (req, res) => {
  res.json("hello world");
});

app.post("/api/v1/signup", (req, res) => {
  const { email } = req.body;

  const token = jwt.sign({ email }, process.env.JWT_SECRET!);

  const LINK = `http://localhost:3000/auth/verify?token=${token}`;

  try {
    sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to: email,
      subject: "magiclink",
      html: `<a href=${LINK} > MagicLink</a>`,
    });
    console.log("email send");
    res.json({ message: "email sent" });
  } catch (e) {
    console.error(e);
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const { email } = req.body;

  const token = jwt.sign({ id: email }, JWT_SECRET);

  const LINK = `http://localhost:3000/auth/verify?token=${token}`;

  try {
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to: email,
      subject: "magiclink",
      html: `<a href=${LINK} > MagicLink</a>`,
    });
    console.log("email send");
    res.json({ message: "email sent" });
  } catch (e) {
    console.error(e);
  }
});

app.get("/api/v1/verify", async (req, res) => {
  const { token } = req.query;

  const { id } = jwt.verify(token as string, JWT_SECRET) as any;
  if (!id) res.status(401).json({ message: "Invalid token" });
  res.setHeader("Set-Cookie", `token=${token}; Max-Age=3600`);
  res.send("Cookie set successfully");
});

app.get("/api/v1/supportedAssets", (req, res) => {
  const assets = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      imageUrl: `http://localhost:${PORT}/assets/btc.png`,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      imageUrl: `http://localhost:${PORT}/assets/eth.png`,
    },
    {
      symbol: "SOL",
      name: "Solana",
      imageUrl: `http://localhost:${PORT}/assets/sol.png`,
    },
  ];

  res.json({ assets });
});


app.use(verifyToken);

app.listen(PORT, () => {
  console.log("app running on port ", PORT);
});

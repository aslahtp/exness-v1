import WebSocket from "ws";
import Redis from "ioredis";

type Prices = {
  price_updates: trade[];
};

type trade = {
  asset: string;
  price: number;
  decimal: number;
};

const ws = new WebSocket("wss://ws.backpack.exchange");

const redis = new Redis();

ws.on("open", () => {
  console.log("websocket connected");
  ws.send(
    JSON.stringify({
      method: "SUBSCRIBE",
      params: [
        "bookTicker.SOL_USDC",
        "bookTicker.BTC_USDC",
        "bookTicker.ETH_USDC",
      ],
    })
  );
});

ws.on("close", () => {
  console.log("Websocket closed");
});

ws.on("error", () => {
  console.log("Error connecting to websocket");
  ws.close();
});

let SOLtradeData: trade;
let ETHtradeData: trade;
let BTCtradeData: trade;

let prices: Prices;

ws.on("message", (msg) => {
  const data = JSON.parse(msg.toString()).data;

  let symbol: string = "";
  let decimal: number = 0;
  if (data.s == "SOL_USDC") {
    SOLtradeData = {
      asset: "SOL",
      price: parseInt(data.a) * 1000000,
      decimal: 6,
    };
  } else if (data.s == "ETH_USDC") {
    ETHtradeData = {
      asset: "ETH",
      price: parseInt(data.a) * 1000000,
      decimal: 6,
    };
  } else if (data.s == "BTC_USDC") {
    BTCtradeData = {
      asset: "BTC",
      price: parseInt(data.a) * 10000,
      decimal: 4,
    };
  }

  prices = {
    price_updates: [SOLtradeData, BTCtradeData, ETHtradeData],
  };
});

setInterval(async () => {
  await pricePoll(prices);
}, 100);

async function pricePoll(pricesData: Prices) {
  console.log("Injecting data to queue", pricesData);

  await redis.xadd("latest-prices", "*", "data", JSON.stringify(pricesData));
}

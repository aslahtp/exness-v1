import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookies are automatically sent with withCredentials: true
// No need to manually add token to headers

export interface Asset {
  symbol: "BTC" | "ETH" | "SOL";
  name: string;
  imageUrl: string;
}

export interface Balance {
  BTC?: number;
  ETH?: number;
  SOL?: number;
}

export interface TradeCreateRequest {
  asset: "BTC" | "ETH" | "SOL";
  type: "long" | "short";
  margin: number;
  leverage: number;
  slippage: number;
}

export interface TradeCloseRequest {
  orderId: string;
}

export const authApi = {
  signup: async (email: string) => {
    const response = await api.post("/api/v1/signup", { email });
    return response.data;
  },
  signin: async (email: string) => {
    const response = await api.post("/api/v1/signin", { email });
    return response.data;
  },
  verify: async (token: string) => {
    const response = await api.get("/api/v1/verify", { params: { token } });
    return response.data;
  },
};

export const assetsApi = {
  getSupportedAssets: async (): Promise<{ assets: Asset[] }> => {
    const response = await api.get("/api/v1/supportedAssets");
    return response.data;
  },
};

export const balanceApi = {
  getBalance: async (): Promise<Balance> => {
    const response = await api.get("/api/v1/balance");
    return response.data;
  },
  getAssetBalance: async (asset: "BTC" | "ETH" | "SOL"): Promise<Balance> => {
    const response = await api.get(`/api/v1/balance/${asset}`);
    return response.data;
  },
};

export const tradesApi = {
  createTrade: async (
    data: TradeCreateRequest
  ): Promise<{ orderId: string }> => {
    const response = await api.post("/api/v1/trades/create", data);
    return response.data;
  },
  closeTrade: async (data: TradeCloseRequest): Promise<any> => {
    const response = await api.post("/api/v1/trades/close", data);
    return response.data;
  },
};

export default api;

"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  assetsApi,
  tradesApi,
  balanceApi,
  type Asset,
  type TradeCreateRequest,
  type Balance,
} from "@/lib/api";

export default function TradePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [balance, setBalance] = useState<Balance>({});
  const [selectedAsset, setSelectedAsset] = useState<"BTC" | "ETH" | "SOL">(
    "BTC"
  );
  const [tradeType, setTradeType] = useState<"long" | "short">("long");
  const [margin, setMargin] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [slippage, setSlippage] = useState("0.1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, balanceData] = await Promise.all([
          assetsApi.getSupportedAssets(),
          balanceApi.getBalance(),
        ]);
        setAssets(assetsData.assets);
        setBalance(balanceData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const tradeData: TradeCreateRequest = {
        asset: selectedAsset,
        type: tradeType,
        margin: parseFloat(margin),
        leverage: parseFloat(leverage),
        slippage: parseFloat(slippage),
      };

      const result = await tradesApi.createTrade(tradeData);
      setMessage({
        type: "success",
        text: `Trade created successfully! Order ID: ${result.orderId}`,
      });

      // Store position in localStorage (in a real app, this would come from an API)
      const position = {
        orderId: result.orderId,
        asset: selectedAsset,
        type: tradeType,
        margin: parseFloat(margin),
        leverage: parseFloat(leverage),
        status: "open" as const,
      };
      const existing = JSON.parse(localStorage.getItem("positions") || "[]");
      localStorage.setItem("positions", JSON.stringify([...existing, position]));

      // Reset form
      setMargin("");
      setLeverage("1");
      setSlippage("0.1");

      // Refresh balance
      const newBalance = await balanceApi.getBalance();
      setBalance(newBalance);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create trade",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableBalance = balance[selectedAsset] || 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Open Trade</h1>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Asset
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => setSelectedAsset(asset.symbol)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedAsset === asset.symbol
                          ? "border-blue-500 bg-blue-900/20"
                          : "border-gray-700 bg-gray-700/50 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={asset.imageUrl}
                          alt={asset.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/32";
                          }}
                        />
                        <div className="text-left">
                          <p className="text-white font-semibold">
                            {asset.symbol}
                          </p>
                          <p className="text-xs text-gray-400">
                            {asset.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Available Balance: {availableBalance.toFixed(4)} {selectedAsset}
                </p>
              </div>

              {/* Trade Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trade Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTradeType("long")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tradeType === "long"
                        ? "border-green-500 bg-green-900/20 text-green-400"
                        : "border-gray-700 bg-gray-700/50 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <span className="font-semibold">Long</span>
                    <p className="text-xs mt-1">Buy / Go Up</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType("short")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tradeType === "short"
                        ? "border-red-500 bg-red-900/20 text-red-400"
                        : "border-gray-700 bg-gray-700/50 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <span className="font-semibold">Short</span>
                    <p className="text-xs mt-1">Sell / Go Down</p>
                  </button>
                </div>
              </div>

              {/* Margin */}
              <div>
                <label
                  htmlFor="margin"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Margin ({selectedAsset})
                </label>
                <input
                  id="margin"
                  type="number"
                  step="0.0001"
                  min="0"
                  max={availableBalance}
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0000"
                />
              </div>

              {/* Leverage */}
              <div>
                <label
                  htmlFor="leverage"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Leverage
                </label>
                <input
                  id="leverage"
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Leverage multiplies your position size
                </p>
              </div>

              {/* Slippage */}
              <div>
                <label
                  htmlFor="slippage"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Slippage (%)
                </label>
                <input
                  id="slippage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-900 text-green-200"
                      : "bg-red-900 text-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !margin || parseFloat(margin) <= 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                  tradeType === "long"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading
                  ? "Creating Trade..."
                  : tradeType === "long"
                  ? "Open Long Position"
                  : "Open Short Position"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

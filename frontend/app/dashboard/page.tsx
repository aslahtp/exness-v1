"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { balanceApi, assetsApi, type Asset, type Balance } from "@/lib/api";

export default function DashboardPage() {
  const [balance, setBalance] = useState<Balance>({});
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [balanceData, assetsData] = await Promise.all([
          balanceApi.getBalance(),
          assetsApi.getSupportedAssets(),
        ]);
        setBalance(balanceData);
        setAssets(assetsData.assets);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-900 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {assets.map((asset) => (
              <div
                key={asset.symbol}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/40";
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {asset.symbol}
                      </h3>
                      <p className="text-sm text-gray-400">{asset.name}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {balance[asset.symbol]?.toFixed(4) || "0.0000"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Total Balance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.symbol} className="text-center">
                  <p className="text-sm text-gray-400">{asset.symbol}</p>
                  <p className="text-lg font-semibold text-white">
                    {balance[asset.symbol]?.toFixed(4) || "0.0000"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


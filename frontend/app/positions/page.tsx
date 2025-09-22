"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { tradesApi } from "@/lib/api";

interface Position {
  orderId: string;
  asset: "BTC" | "ETH" | "SOL";
  type: "long" | "short";
  margin: number;
  leverage: number;
  status: "open" | "closed" | "liquidated";
  pnl?: number;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // In a real app, you'd fetch positions from an API
  // For now, we'll use localStorage to store positions
  useEffect(() => {
    const stored = localStorage.getItem("positions");
    if (stored) {
      setPositions(JSON.parse(stored));
    }
  }, []);

  const handleClosePosition = async (orderId: string) => {
    setClosingOrderId(orderId);
    setMessage(null);

    try {
      const result = await tradesApi.closeTrade({ orderId });
      setMessage({
        type: "success",
        text: `Position closed successfully! PnL: ${result.pnl || 0}`,
      });

      // Update position status
      const updated = positions.map((p) =>
        p.orderId === orderId ? { ...p, status: "closed" as const, pnl: result.pnl } : p
      );
      setPositions(updated);
      localStorage.setItem("positions", JSON.stringify(updated));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to close position",
      });
    } finally {
      setClosingOrderId(null);
    }
  };

  const openPositions = positions.filter((p) => p.status === "open");
  const closedPositions = positions.filter((p) => p.status === "closed");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">Positions</h1>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900 text-green-200"
                  : "bg-red-900 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Open Positions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Open Positions ({openPositions.length})
            </h2>
            {openPositions.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center text-gray-400">
                No open positions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg border border-gray-700">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Leverage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {openPositions.map((position) => (
                      <tr key={position.orderId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.orderId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.asset}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              position.type === "long"
                                ? "bg-green-900 text-green-200"
                                : "bg-red-900 text-red-200"
                            }`}
                          >
                            {position.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.margin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.leverage}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleClosePosition(position.orderId)}
                            disabled={closingOrderId === position.orderId}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {closingOrderId === position.orderId
                              ? "Closing..."
                              : "Close"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Closed Positions */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Closed Positions ({closedPositions.length})
            </h2>
            {closedPositions.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center text-gray-400">
                No closed positions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg border border-gray-700">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Leverage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        PnL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {closedPositions.map((position) => (
                      <tr key={position.orderId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.orderId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.asset}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              position.type === "long"
                                ? "bg-green-900 text-green-200"
                                : "bg-red-900 text-red-200"
                            }`}
                          >
                            {position.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.margin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {position.leverage}x
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                            (position.pnl || 0) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {(position.pnl || 0) >= 0 ? "+" : ""}
                          {position.pnl?.toFixed(4) || "0.0000"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


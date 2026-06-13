import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StockDetailChart from "../components/StockDetailChart.jsx";
import api from "../services/api";

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get(`/stocks/${symbol}`);
        setStock(resp.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stock");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [symbol]);

  const tradeStock = async (type) => {
    const quantity = Number(
      window.prompt(
        `Enter quantity to ${type.toLowerCase()} ${stock.symbol}`
      )
    );

    if (!quantity || quantity <= 0) {
      return;
    }

    try {
      await api.post(`/portfolio/${type.toLowerCase()}`, {
        symbol: stock.symbol,
        quantity,
      });

      setMessage(
        `${type} successful for ${quantity} share(s) of ${stock.symbol}`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || `${type} failed`
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {error}
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-12">
        Stock not found
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {stock.symbol}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              {stock.company}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              ₹{stock.currentPrice.toFixed(2)}
            </p>

            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                stock.trend === "UP"
                  ? "bg-green-100 text-green-800"
                  : stock.trend === "DOWN"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {stock.trend}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-teal-800">
          {message}
        </div>
      )}

      <StockDetailChart
        symbol={stock.symbol}
        company={stock.company}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Stock Info
          </h3>

          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-500">
                Symbol
              </dt>
              <dd className="text-lg font-semibold text-slate-900">
                {stock.symbol}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Company
              </dt>
              <dd className="text-lg font-semibold text-slate-900">
                {stock.company}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Trend
              </dt>
              <dd
                className={`text-lg font-semibold ${
                  stock.trend === "UP"
                    ? "text-green-600"
                    : stock.trend === "DOWN"
                    ? "text-red-600"
                    : "text-slate-600"
                }`}
              >
                {stock.trend}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Volatility
              </dt>
              <dd className="text-lg font-semibold text-slate-900">
                {(stock.volatility * 100).toFixed(1)}%
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => tradeStock("BUY")}
              className="w-full rounded-md bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Buy {stock.symbol}
            </button>

            <button
              onClick={() => tradeStock("SELL")}
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Sell {stock.symbol}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
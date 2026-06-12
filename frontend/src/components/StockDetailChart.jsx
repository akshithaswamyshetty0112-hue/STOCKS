import React, { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";

const StockDetailChart = ({ symbol, company }) => {
  const [history, setHistory] = useState([]);
  const [trend, setTrend] = useState("STABLE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await api.get(`/stocks/${symbol}/history`);
        setHistory(resp.data.history);
        setTrend(resp.data.trend);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chart");
      } finally {
        setLoading(false);
      }
    };

    if (symbol) load();
  }, [symbol]);

  if (loading) return <div className="rounded-lg border border-slate-200 bg-white p-6 h-80 flex items-center justify-center text-slate-500">Loading chart...</div>;

  if (error) return <div className="rounded-lg border border-slate-200 bg-white p-6 h-80 flex items-center justify-center text-red-500">{error}</div>;

  const trendColor = trend === "UP" ? "#10b981" : trend === "DOWN" ? "#ef4444" : "#6b7280";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{symbol}</p>
          <h2 className="text-xl font-semibold text-slate-900">{company}</h2>
        </div>
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: trendColor + "20", color: trendColor }}>
          {trend}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "6px", color: "#f1f5f9" }}
              formatter={(value) => `₹${value.toFixed(2)}`}
              labelFormatter={(label) => `Time: ${label}s`}
            />
            <Area type="monotone" dataKey="price" stroke={trendColor} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {history.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Current Price</p>
            <p className="text-lg font-semibold text-slate-900">₹{history[history.length - 1].price.toFixed(2)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs text-slate-500">High (24h)</p>
            <p className="text-lg font-semibold text-slate-900">₹{Math.max(...history.map(h => h.price)).toFixed(2)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Low (24h)</p>
            <p className="text-lg font-semibold text-slate-900">₹{Math.min(...history.map(h => h.price)).toFixed(2)}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default StockDetailChart;

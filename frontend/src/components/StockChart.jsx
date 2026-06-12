import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";

const StockChart = ({ stocks }) => {
  const getBarColor = (trend) => {
    if (trend === "UP") return "#10b981";
    if (trend === "DOWN") return "#ef4444";
    return "#0f766e";
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Live Prices</h2>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stocks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Bar dataKey="currentPrice" fill="#0f766e" radius={[4, 4, 0, 0]}>
              {stocks.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default StockChart;

import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../services/api";

const MarketStatus = () => {
  const [status, setStatus] = useState({
    market: "STABLE",
    topGainer: "",
    topLoser: "",
    movements: []
  });

  const fetchMarketStatus = async () => {
    const response = await api.get("/market/status");
    setStatus(response.data);
  };

  useEffect(() => {
    fetchMarketStatus();

    const intervalId = setInterval(fetchMarketStatus, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const marketColor =
    status.market === "BULL"
      ? "text-teal-700"
      : status.market === "BEAR"
        ? "text-rose-600"
        : "text-amber-700";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Market Simulator System</p>
          <h2 className={`mt-1 text-2xl font-semibold ${marketColor}`}>{status.market}</h2>
        </div>
        <div className="grid gap-1 text-sm text-slate-600">
          <span>Top gainer: <strong className="text-slate-900">{status.topGainer || "N/A"}</strong></span>
          <span>Top loser: <strong className="text-slate-900">{status.topLoser || "N/A"}</strong></span>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={status.movements}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="change" stroke="#0f766e" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default MarketStatus;

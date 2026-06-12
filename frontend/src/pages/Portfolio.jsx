import React from "react";
import { useEffect, useState } from "react";
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

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState({ balance: 0, stocks: [] });

  const fetchPortfolio = async () => {
    const response = await api.get("/portfolio");
    setPortfolio(response.data);
  };

  useEffect(() => {
    fetchPortfolio();

    const intervalId = setInterval(fetchPortfolio, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const totalValue = portfolio.stocks.reduce((sum, stock) => sum + stock.currentValue, 0);
  const totalProfitLoss = portfolio.stocks.reduce((sum, stock) => sum + stock.profitLoss, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Current balance</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">${portfolio.balance.toFixed(2)}</h1>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Holdings value</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">${totalValue.toFixed(2)}</h2>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Profit / Loss</p>
          <h2 className={totalProfitLoss >= 0 ? "mt-2 text-2xl font-semibold text-teal-700" : "mt-2 text-2xl font-semibold text-rose-600"}>${totalProfitLoss.toFixed(2)}</h2>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Portfolio Chart</h2>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={portfolio.stocks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="currentValue" stroke="#0f766e" strokeWidth={3} />
              <Line type="monotone" dataKey="investment" stroke="#b45309" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Owned Stocks</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Symbol</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Quantity</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Avg Buy Price</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Current Price</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Current Value</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.stocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">{stock.symbol}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{stock.quantity}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">${stock.avgBuyPrice.toFixed(2)}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">${stock.currentPrice.toFixed(2)}</td>
                  <td className="border-b border-slate-100 px-3 py-4 font-bold text-slate-900">${stock.currentValue.toFixed(2)}</td>
                  <td className={stock.profitLoss >= 0 ? "border-b border-slate-100 px-3 py-4 font-semibold text-teal-700" : "border-b border-slate-100 px-3 py-4 font-semibold text-rose-600"}>
                    ${stock.profitLoss.toFixed(2)}
                  </td>
                </tr>
              ))}
              {portfolio.stocks.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan="6">No stocks owned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;

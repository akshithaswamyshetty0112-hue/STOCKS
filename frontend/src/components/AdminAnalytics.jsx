import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const AdminAnalytics = ({ analytics }) => {
  const transactionTrend = [
    { type: "BUY", count: analytics.buyTransactions || 0 },
    { type: "SELL", count: analytics.sellTransactions || 0 }
  ];

  const cards = [
    { label: "Users", value: analytics.usersCount || 0 },
    { label: "Stocks", value: analytics.stocksCount || 0 },
    { label: "Transactions", value: analytics.transactionsCount || 0 },
    { label: "Trade Value", value: `$${Number(analytics.totalTradeValue || 0).toFixed(2)}` }
  ];

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div className="rounded-lg border border-slate-200 bg-white p-5" key={card.label}>
            <p className="text-sm font-semibold uppercase text-slate-500">{card.label}</p>
            <strong className="mt-2 block text-2xl font-semibold text-slate-900">{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">Transaction Trends</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={transactionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold text-slate-900">Market Movement</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.marketMovements || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="change" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminAnalytics;

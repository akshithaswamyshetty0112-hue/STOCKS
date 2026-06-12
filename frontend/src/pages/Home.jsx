import React from "react";
import { Link } from "react-router-dom";

const previewStocks = [
  { symbol: "AAPL", company: "Apple Inc.", price: 185.42, change: "+2.8%" },
  { symbol: "TSLA", company: "Tesla Inc.", price: 245.18, change: "-1.4%" },
  { symbol: "META", company: "Meta Platforms", price: 330.61, change: "+3.1%" },
  { symbol: "GOOG", company: "Alphabet Inc.", price: 140.95, change: "+1.2%" }
];

const Home = () => {
  return (
    <div className="grid gap-6">
      <section className="grid min-h-[500px] items-center gap-8 rounded-lg border border-slate-200 bg-[linear-gradient(120deg,rgba(15,23,42,0.90),rgba(20,83,45,0.74)),url('https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center p-7 text-white md:grid-cols-[minmax(0,1fr)_400px] md:p-12">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-100">Practice before you risk real money</p>
          <h1 className="mt-3 text-5xl font-semibold leading-none md:text-7xl">Stock Simulator</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100 md:text-xl">
            Build trading confidence with a virtual balance, simulated live prices, portfolio
            tracking, charts, and transaction history.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-md bg-teal-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-teal-800" to="/register">
              Start Trading
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-md bg-teal-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-teal-800" to="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/50 bg-white/95 p-5 text-slate-900" aria-label="Market preview">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 text-sm text-slate-500">
            <span>Simulated Market</span>
            <strong className="font-semibold text-slate-700">Updates every 5s</strong>
          </div>
          {previewStocks.map((stock) => (
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-0 last:pb-0" key={stock.symbol}>
              <div className="grid gap-1">
                <strong className="text-lg font-semibold">{stock.symbol}</strong>
                <span className="text-sm text-slate-500">{stock.company}</span>
              </div>
              <div className="grid justify-items-end gap-1">
                <strong className="font-semibold">${stock.price.toFixed(2)}</strong>
                <span className={stock.change.startsWith("+") ? "text-sm font-medium text-teal-700" : "text-sm font-medium text-rose-600"}>
                  {stock.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-teal-200">
          <strong className="block text-3xl font-semibold text-slate-900">$100,000</strong>
          <span className="text-slate-500">Starting virtual balance</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-teal-200">
          <strong className="block text-3xl font-semibold text-slate-900">4</strong>
          <span className="text-slate-500">Beginner-friendly stocks</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-teal-200">
          <strong className="block text-3xl font-semibold text-slate-900">REST</strong>
          <span className="text-slate-500">Clean MERN APIs</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Trade Safely</h2>
          <p className="leading-7 text-slate-500">Buy and sell AAPL, TSLA, META, and GOOG using virtual money while learning the full trading flow.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Track Performance</h2>
          <p className="leading-7 text-slate-500">See your holdings, current value, investment, and profit or loss as prices move.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">Learn MERN</h2>
          <p className="leading-7 text-slate-500">Understand authentication, protected routes, MongoDB schemas, Axios calls, and polling.</p>
        </article>
      </section>
    </div>
  );
};

export default Home;

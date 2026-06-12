import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MarketStatus from "../components/MarketStatus.jsx";
import StockChart from "../components/StockChart.jsx";
import RazorpayCheckout from "../components/RazorpayCheckout.jsx";
import WithdrawalModal from "../components/WithdrawalModal.jsx";
import TransactionHistory from "../components/TransactionHistory.jsx";
import api from "../services/api";

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [refreshTx, setRefreshTx] = useState(0);

  const fetchDashboard = async () => {
    const [stocksResponse, portfolioResponse] = await Promise.all([
      api.get("/stocks"),
      api.get("/portfolio")
    ]);

    setStocks(stocksResponse.data);
    setBalance(portfolioResponse.data.balance);
  };

  useEffect(() => {
    fetchDashboard();

    const intervalId = setInterval(fetchDashboard, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const tradeStock = async (type, symbol) => {
    const quantity = Number(window.prompt(`Enter quantity to ${type.toLowerCase()} for ${symbol}`));

    if (!quantity || quantity <= 0) {
      return;
    }

    try {
      await api.post(`/portfolio/${type.toLowerCase()}`, { symbol, quantity });
      setMessage(`${type} successful for ${symbol}`);
      fetchDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || `${type} failed`);
    }
  };

  const handlePaymentSuccess = (amount) => {
    setBalance((prev) => prev + amount);
    setMessage(`✓ Successfully added ₹${amount} to your account!`);
    setTimeout(() => setMessage(""), 3000);
    fetchDashboard();
    setRefreshTx(prev => prev + 1);
  };

  const handleWithdrawalSuccess = (amount) => {
    setBalance((prev) => prev - amount);
    setMessage(`✓ Withdrawal of ₹${amount} requested successfully!`);
    setTimeout(() => setMessage(""), 3000);
    fetchDashboard();
    setRefreshTx(prev => prev + 1);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Virtual balance</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">₹{balance.toFixed(2)}</h1>
        </div>
        <div className="flex flex-col gap-2">
          {message && <p className="rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">{message}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setShowPayment(true)}
              className="rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              + Add Funds
            </button>
            <button
              onClick={() => setShowWithdrawal(true)}
              className="rounded-md bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800"
            >
              ➖ Withdraw
            </button>
          </div>
        </div>
      </section>

      <StockChart stocks={stocks} />

      <MarketStatus />

      <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Stocks</h2>
          <p className="mt-1 text-slate-500">Prices update every 5 seconds using backend market simulation.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Symbol</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Company</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Price</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Trend</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Trade</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">
                    <Link to={`/stock/${stock.symbol}`} className="text-teal-600 hover:text-teal-800">
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{stock.company}</td>
                  <td className="border-b border-slate-100 px-3 py-4 font-bold text-slate-900">₹{stock.currentPrice.toFixed(2)}</td>
                  <td className="border-b border-slate-100 px-3 py-4">
                    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${stock.trend === "UP" ? "bg-green-100 text-green-800" : stock.trend === "DOWN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                      {stock.trend}
                    </div>
                  </td>
                  <td className="flex gap-2 border-b border-slate-100 px-3 py-4">
                    <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800" onClick={() => tradeStock("BUY", stock.symbol)}>Buy</button>
                    <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:text-slate-950" onClick={() => tradeStock("SELL", stock.symbol)}>
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lg:col-span-2">
        <TransactionHistory key={refreshTx} />
      </section>

      {showPayment && (
        <RazorpayCheckout
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showWithdrawal && (
        <WithdrawalModal
          onSuccess={handleWithdrawalSuccess}
          onClose={() => setShowWithdrawal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

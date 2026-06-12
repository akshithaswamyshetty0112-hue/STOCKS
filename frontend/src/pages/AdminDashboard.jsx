import React, { useEffect, useState } from "react";
import AdminAnalytics from "../components/AdminAnalytics.jsx";
import AdminStockCard from "../components/AdminStockCard.jsx";
import AuditLogTable from "../components/AuditLogTable.jsx";
import UsersTable from "../components/UsersTable.jsx";
import api from "../services/api";

const emptyForm = {
  symbol: "",
  company: "",
  currentPrice: ""
};

const AdminDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const fetchAdminData = async () => {
    const [stocksResponse, usersResponse, transactionsResponse, analyticsResponse, auditLogsResponse] = await Promise.all([
      api.get("/stocks"),
      api.get("/admin/allUsers"),
      api.get("/admin/allTransactions"),
      api.get("/admin/analytics"),
      api.get("/admin/auditLogs")
    ]);

    setStocks(stocksResponse.data);
    setUsers(usersResponse.data);
    setTransactions(transactionsResponse.data);
    setAnalytics(analyticsResponse.data);
    setAuditLogs(auditLogsResponse.data);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleAddStock = async (event) => {
    event.preventDefault();
    await api.post("/admin/addStock", form);
    setForm(emptyForm);
    setMessage("Stock added successfully");
    fetchAdminData();
  };

  const handleUpdateStock = async (stock) => {
    const nextPrice = window.prompt(`Enter new price for ${stock.symbol}`, stock.currentPrice);

    if (!nextPrice) {
      return;
    }

    await api.put("/admin/updateStock", {
      symbol: stock.symbol,
      company: stock.company,
      currentPrice: Number(nextPrice)
    });

    setMessage("Stock updated successfully");
    fetchAdminData();
  };

  const handleDeleteStock = async (symbol) => {
    await api.delete("/admin/deleteStock", { data: { symbol } });
    setMessage("Stock removed successfully");
    fetchAdminData();
  };

  const handleResetMarket = async () => {
    await api.post("/admin/resetMarket");
    setMessage("Market reset successfully");
    fetchAdminData();
  };

  const handleTriggerSimulation = async () => {
    await api.post("/admin/triggerMarketSimulation");
    setMessage("Market simulation triggered");
    fetchAdminData();
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800" onClick={handleTriggerSimulation}>
              Trigger Simulation
            </button>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50" onClick={handleResetMarket}>
              Reset Market
            </button>
          </div>
        </div>
        {message && <p className="rounded-md bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{message}</p>}
      </section>

      <AdminAnalytics analytics={analytics} />

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">Add Stock</h2>
        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleAddStock}>
          <input className="rounded-md border border-slate-300 px-3 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="symbol" placeholder="Symbol" value={form.symbol} onChange={handleChange} required />
          <input className="rounded-md border border-slate-300 px-3 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
          <input className="rounded-md border border-slate-300 px-3 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="currentPrice" placeholder="Current Price" type="number" min="10" value={form.currentPrice} onChange={handleChange} required />
          <button className="inline-flex min-h-12 items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-teal-800" type="submit">
            Add Stock
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stocks.map((stock) => (
          <AdminStockCard
            key={stock._id}
            stock={stock}
            onDelete={handleDeleteStock}
            onUpdate={handleUpdateStock}
          />
        ))}
      </section>

      <UsersTable users={users} onRefresh={fetchAdminData} />

      <AuditLogTable logs={auditLogs} />

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-xl font-semibold text-slate-900">All Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">User</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Type</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Symbol</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Quantity</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Price</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{transaction.userId?.email || "Unknown"}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{transaction.type}</td>
                  <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">{transaction.symbol}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{transaction.quantity}</td>
                  <td className="border-b border-slate-100 px-3 py-4 text-slate-600">${transaction.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

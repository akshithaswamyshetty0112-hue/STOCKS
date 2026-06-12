import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    };

    fetchTransactions();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h1 className="text-3xl font-semibold text-slate-900">Transactions</h1>
        <p className="mt-1 text-slate-500">Newest transactions appear first.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Date</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Type</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Symbol</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Quantity</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{new Date(transaction.date).toLocaleString()}</td>
                <td>
                  <span className={transaction.type === "BUY" ? "inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700" : "inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"}>
                    {transaction.type}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">{transaction.symbol}</td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{transaction.quantity}</td>
                <td className="border-b border-slate-100 px-3 py-4 font-bold text-slate-900">${transaction.price.toFixed(2)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan="5">No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Transactions;

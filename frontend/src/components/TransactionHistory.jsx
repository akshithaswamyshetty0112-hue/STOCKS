import React, { useEffect, useState } from "react";
import { getTransactionHistory } from "../services/payment";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactionHistory();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      CREATED: "bg-gray-700 text-gray-200",
      PENDING: "bg-yellow-900/40 text-yellow-300",
      PAID: "bg-green-900/40 text-green-300",
      PROCESSED: "bg-green-900/40 text-green-300",
      FAILED: "bg-red-900/40 text-red-300"
    };
    return statusStyles[status] || statusStyles.CREATED;
  };

  const getTypeColor = (type) => {
    return type === "DEPOSIT" ? "text-green-400" : "text-red-400";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        <div className="text-center text-gray-400">No transactions yet</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-300">Type</th>
              <th className="text-left py-3 px-4 text-gray-300">Amount</th>
              <th className="text-left py-3 px-4 text-gray-300">Status</th>
              <th className="text-left py-3 px-4 text-gray-300">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="py-3 px-4">
                  <span className={`font-semibold ${getTypeColor(tx.type)}`}>
                    {tx.type === "DEPOSIT" ? "➕ Deposit" : "➖ Withdrawal"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={tx.type === "DEPOSIT" ? "text-green-400" : "text-red-400"}>
                    {tx.type === "DEPOSIT" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {formatDate(tx.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import api from "../services/api";

const UsersTable = ({ users, onRefresh }) => {
  const [adjusting, setAdjusting] = useState({}); // { userId: amount string }
  const [feedback, setFeedback] = useState({});   // { userId: message }

  const flash = (userId, msg) => {
    setFeedback(prev => ({ ...prev, [userId]: msg }));
    setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[userId]; return n; }), 3000);
  };

  const toggleBlock = async (user) => {
    try {
      await api.post("/admin/blockUser", { userId: user._id, blocked: !user.blocked });
      flash(user._id, user.blocked ? "✅ User unblocked" : "🔒 User blocked");
      if (onRefresh) onRefresh();
    } catch (err) {
      flash(user._id, err?.response?.data?.message || "Failed to update user status");
    }
  };

  const handleAdjust = async (user, sign) => {
    const raw = adjusting[user._id];
    const amount = Number(raw);
    if (!raw || isNaN(amount) || amount <= 0) {
      flash(user._id, "Enter a valid positive amount");
      return;
    }
    try {
      await api.post("/admin/adjustBalance", {
        userId: user._id,
        amount: sign * amount,
        reason: "Admin manual adjustment"
      });
      flash(user._id, `${sign > 0 ? "✅ Credited" : "✅ Debited"} ₹${amount}`);
      setAdjusting(prev => { const n = { ...prev }; delete n[user._id]; return n; });
      if (onRefresh) onRefresh();
    } catch (err) {
      flash(user._id, err?.response?.data?.message || "Balance adjustment failed");
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-semibold text-slate-900">Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Name</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Email</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Role</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Balance</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Status</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Adjust Balance</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Block</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={user.role === "admin" ? "bg-teal-50" : user.blocked ? "bg-red-50" : ""}>
                <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">{user.name}</td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{user.email}</td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span>{user.role}</span>
                    {user.role === "admin" && (
                      <span className="inline-flex items-center rounded-full bg-teal-600 px-2 py-1 text-xs font-semibold text-white">ADMIN</span>
                    )}
                    {user.blocked && (
                      <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">BLOCKED</span>
                    )}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">
                  ₹{user.balance != null ? user.balance.toFixed(2) : "—"}
                </td>
                {/* Feedback */}
                <td className="border-b border-slate-100 px-3 py-2 text-xs text-teal-700 font-medium min-w-[110px]">
                  {feedback[user._id] || ""}
                </td>
                {/* Balance adjustment */}
                <td className="border-b border-slate-100 px-3 py-3">
                  {user.role !== "admin" ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Amount"
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-teal-500"
                        value={adjusting[user._id] || ""}
                        onChange={e => setAdjusting(prev => ({ ...prev, [user._id]: e.target.value }))}
                      />
                      <button
                        className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        onClick={() => handleAdjust(user, 1)}
                        title="Credit"
                      >+ Credit</button>
                      <button
                        className="rounded-md bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                        onClick={() => handleAdjust(user, -1)}
                        title="Debit"
                      >− Debit</button>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </td>
                {/* Block/Unblock */}
                <td className="border-b border-slate-100 px-3 py-4">
                  {user.role !== "admin" ? (
                    <button
                      className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white ${
                        user.blocked ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                      onClick={() => toggleBlock(user)}
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsersTable;


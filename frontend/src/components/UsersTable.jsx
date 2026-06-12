import React from "react";
import api from "../services/api";

const UsersTable = ({ users, onRefresh }) => {

  const toggleBlock = async (user) => {
    try {
      await api.post("/admin/blockUser", { userId: user._id, blocked: !user.blocked });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update user status");
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
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={user.role === "admin" ? "bg-teal-50" : ""}>
                <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">{user.name}</td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">{user.email}</td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span>{user.role}</span>
                    {user.role === "admin" && (
                      <span className="inline-flex items-center rounded-full bg-teal-600 px-2 py-1 text-xs font-semibold text-white">ADMIN</span>
                    )}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">${user.balance.toFixed(2)}</td>
                <td className="border-b border-slate-100 px-3 py-4">
                  {user.role !== "admin" && (
                    <button
                      className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white ${user.blocked ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"}`}
                      onClick={() => toggleBlock(user)}
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
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

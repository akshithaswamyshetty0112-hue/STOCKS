import React from "react";

const AuditLogTable = ({ logs }) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase text-slate-500">Admin Tracking</p>
        <h2 className="text-xl font-semibold text-slate-900">System Activity</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Time</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Actor</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Action</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Entity</th>
              <th className="border-b border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-500">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                  {log.actorEmail}
                </td>
                <td className="border-b border-slate-100 px-3 py-4 font-semibold text-slate-900">
                  {log.action}
                </td>
                <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                  {log.entity}
                </td>
                <td className="max-w-md border-b border-slate-100 px-3 py-4 text-sm text-slate-500">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan="5">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AuditLogTable;

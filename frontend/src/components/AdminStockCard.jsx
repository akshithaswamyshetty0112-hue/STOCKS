import React from "react";

const AdminStockCard = ({ stock, onDelete, onUpdate }) => {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{stock.symbol}</h3>
          <p className="text-sm text-slate-500">{stock.company}</p>
        </div>
        <strong className="text-lg font-semibold text-teal-700">${stock.currentPrice.toFixed(2)}</strong>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800" onClick={() => onUpdate(stock)}>
          Update
        </button>
        <button className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50" onClick={() => onDelete(stock.symbol)}>
          Remove
        </button>
      </div>
    </article>
  );
};

export default AdminStockCard;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Stocks = () => {
const [stocks, setStocks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

useEffect(() => {
const load = async () => {
try {
const resp = await api.get("/stocks");
setStocks(resp.data);
} catch (err) {
setError(err.response?.data?.message || "Failed to load stocks");
} finally {
setLoading(false);
}
};

load();


}, []);

const tradeStock = async (type, symbol) => {
const quantity = Number(
window.prompt(
`Enter quantity to ${type.toLowerCase()} ${symbol}`
)
);


if (!quantity || quantity <= 0) {
  return;
}

try {
  await api.post(`/portfolio/${type.toLowerCase()}`, {
    symbol,
    quantity,
  });

  setMessage(
    `${type} successful for ${quantity} share(s) of ${symbol}`
  );

  setTimeout(() => {
    setMessage("");
  }, 3000);
} catch (error) {
  setMessage(
    error.response?.data?.message || `${type} failed`
  );
}


};

if (loading) {
return ( <div className="text-center py-12">
Loading stocks... </div>
);
}

if (error) {
return ( <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
{error} </div>
);
}

return ( <div className="grid gap-6"> <div className="rounded-lg border border-slate-200 bg-white p-6"> <h1 className="text-3xl font-bold text-slate-900">
Stocks </h1> <p className="mt-1 text-slate-600">
Browse and trade stocks in real-time </p>


    {message && (
      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-teal-800">
        {message}
      </div>
    )}
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    {stocks.map((stock) => (
      <Link
        key={stock._id}
        to={`/stock/${stock.symbol}`}
        className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-lg"
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              {stock.symbol}
            </p>
            <h3 className="font-semibold text-slate-900">
              {stock.company}
            </h3>
          </div>

          <div
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
              stock.trend === "UP"
                ? "bg-green-100 text-green-800"
                : stock.trend === "DOWN"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {stock.trend}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-2xl font-bold text-slate-900">
            ₹{stock.currentPrice.toFixed(2)}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Volatility: {(stock.volatility * 100).toFixed(1)}%
          </p>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              tradeStock("BUY", stock.symbol);
            }}
            className="flex-1 rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"
          >
            Buy
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              tradeStock("SELL", stock.symbol);
            }}
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Sell
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500 group-hover:text-teal-600">
          Click to view chart →
        </p>
      </Link>
    ))}
  </div>
</div>


);
};

export default Stocks;

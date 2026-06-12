import React, { useState } from "react";
import { createOrder, loadRazorpayScript, verifyPayment } from "../services/payment";

const RazorpayCheckout = ({ onSuccess, onClose }) => {
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const presets = [500, 1000, 2500, 5000, 10000];

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // Load Razorpay script
      await loadRazorpayScript();

      // Create order on backend
      const order = await createOrder(amount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Stock Simulator",
        description: `Add ₹${amount} to your trading account`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Success - add funds and close
            if (onSuccess) {
              onSuccess(amount);
            }
            onClose();
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0f766e"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add Funds</h2>
          <p className="mt-1 text-slate-600">Top up your trading account balance</p>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(100, Number(e.target.value)))}
            className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            min="100"
            step="100"
          />
        </div>

        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-slate-700">Quick amounts</p>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`rounded-md py-2 text-sm font-semibold transition ${
                  amount === preset
                    ? "bg-teal-700 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-md bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Total amount: <span className="font-bold text-slate-900">₹{amount}</span></p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-md border border-slate-300 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || amount < 100}
            className="flex-1 rounded-md bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          Powered by Razorpay. Your payment is secure and encrypted.
        </p>
      </div>
    </div>
  );
};

export default RazorpayCheckout;

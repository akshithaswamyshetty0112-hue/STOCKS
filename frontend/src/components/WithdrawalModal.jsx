import React, { useState } from "react";
import { requestWithdrawal } from "../services/payment";

export default function WithdrawalModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("amount"); // amount, bank-details
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolder: ""
  });
  const [error, setError] = useState("");

  const handleAmountSelect = (value) => {
    setAmount(String(value));
  };

  const handleProceedToBankDetails = () => {
    if (!amount || Number(amount) < 500) {
      setError("Minimum withdrawal amount is ₹500");
      return;
    }
    setError("");
    setStep("bank-details");
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitWithdrawal = async () => {
    if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolder) {
      setError("Please fill all bank details");
      return;
    }

    if (bankDetails.accountNumber.length < 9 || bankDetails.accountNumber.length > 18) {
      setError("Invalid account number");
      return;
    }

    if (bankDetails.ifscCode.length !== 11) {
      setError("IFSC code must be 11 characters");
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal({
        amount: Number(amount),
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        accountHolder: bankDetails.accountHolder
      });

      setLoading(false);
      if (onSuccess) {
        onSuccess(Number(amount));
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Withdrawal request failed");
      setLoading(false);
    }
  };

  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {step === "amount" ? (
          <>
            <div className="mb-6">
              <label className="text-gray-300 block mb-2">Withdrawal Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (min ₹500)"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-gray-400 text-sm mt-1">Minimum withdrawal: ₹500</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-3 text-sm">Quick select:</p>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleAmountSelect(preset)}
                    className={`py-2 px-3 rounded font-medium transition ${
                      String(preset) === amount
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToBankDetails}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-300 mb-4 text-lg font-semibold">
                Withdrawing: <span className="text-green-400">₹{Number(amount).toLocaleString()}</span>
              </p>

              <div className="mb-4">
                <label className="text-gray-300 block mb-2 text-sm">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolder"
                  value={bankDetails.accountHolder}
                  onChange={handleBankDetailsChange}
                  placeholder="Full name as per bank"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="text-gray-300 block mb-2 text-sm">Bank Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleBankDetailsChange}
                  placeholder="10-18 digit account number"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="text-gray-300 block mb-2 text-sm">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={bankDetails.ifscCode}
                  onChange={handleBankDetailsChange}
                  placeholder="e.g., SBIN0001234"
                  maxLength="11"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <p className="text-gray-400 text-xs mb-4">
                ⚠️ Please verify your bank details carefully. Incorrect details may result in failed transactions.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("amount");
                  setError("");
                }}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition font-medium disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmitWithdrawal}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {loading ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

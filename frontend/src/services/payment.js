import api from "./api";

export const createOrder = async (amount) => {
  const resp = await api.post("/payment/create-order", { amount });
  return resp.data.order;
};

export const verifyPayment = async (payload) => {
  const resp = await api.post("/payment/verify", payload);
  return resp.data;
};

export const requestWithdrawal = async (data) => {
  const resp = await api.post("/payment/request-withdrawal", data);
  return resp.data;
};

export const processWithdrawal = async (withdrawalId) => {
  const resp = await api.post("/payment/process-withdrawal", { withdrawalId });
  return resp.data;
};

export const getTransactionHistory = async () => {
  const resp = await api.get("/payment/history");
  return resp.data.transactions;
};

export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
};

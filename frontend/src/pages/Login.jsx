import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="mx-auto mt-10 max-w-md rounded-lg border border-slate-200 bg-white p-7">
      <h1 className="mb-6 text-3xl font-semibold text-slate-900">Login</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2 font-medium text-slate-700">
          Email
          <input className="rounded-md border border-slate-300 px-3 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className="grid gap-2 font-medium text-slate-700">
          Password
          <input
            className="rounded-md border border-slate-300 px-3 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <button className="inline-flex min-h-12 items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-teal-800" type="submit">Login</button>
      </form>
      <p className="mt-5 text-slate-500">
        New here? <Link className="font-medium text-teal-700 hover:text-teal-800" to="/register">
        <p className="text-blue-800" >Create an account</p></Link>
      </p>
    </section>
  );
};

export default Login;

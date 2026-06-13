import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchNotifications, markNotificationRead } from "../services/notifications";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user) return setNotifications([]);
      try {
        const notifs = await fetchNotifications();
        if (mounted) setNotifications(notifs);
      } catch (err) {
        console.error(err);
      }
    };

    load();

    // Refresh notifications every 3 seconds
    const intervalId = setInterval(load, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    const onBodyClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onBodyClick);
    return () => document.removeEventListener("click", onBodyClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = () => setOpen((v) => !v);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    [
      "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition",
      isActive
        ? "bg-teal-50 text-teal-800 ring-1 ring-teal-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    ].join(" ");

  const secondaryButtonClass =
    "inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 hover:text-slate-950";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <Link className="text-xl font-semibold tracking-tight text-slate-900" to={user ? "/dashboard" : "/"}>
        Stock Simulator
      </Link>

      <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
        {user ? (
          <>
            {user.role !== "admin" && (
              <>
                <NavLink className={navLinkClass} to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className={navLinkClass} to="/stocks">
                  Stocks
                </NavLink>
                <NavLink className={navLinkClass} to="/portfolio">
                  Portfolio
                </NavLink>
                <NavLink className={navLinkClass} to="/transactions">
                  Transactions
                </NavLink>
              </>
            )}
            {user.role === "admin" && (
              <>
                <NavLink className={navLinkClass} to="/admin">
                  Admin Panel
                </NavLink>
                <NavLink className={navLinkClass} to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className={navLinkClass} to="/stocks">
                  Stocks
                </NavLink>
                <NavLink className={navLinkClass} to="/portfolio">
                  Portfolio
                </NavLink>
                <NavLink className={navLinkClass} to="/transactions">
                  Transactions
                </NavLink>
              </>
            )}
            <button className={secondaryButtonClass} onClick={handleLogout}>
              Logout
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={handleOpen} className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold">
                <span className="sr-only">Notifications</span>
                <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"></path></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">{unreadCount}</span>}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-80 divide-y divide-slate-100 rounded-md border border-slate-200 bg-white shadow-lg">
                  <div className="p-3">
                    <p className="text-sm font-semibold">Notifications</p>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {notifications.length === 0 && <p className="p-3 text-sm text-slate-500">No notifications</p>}
                    {notifications.map((n) => (
                      <div key={n._id} className={`p-3 ${n.read ? "bg-white" : "bg-teal-50"} cursor-pointer`} onClick={() => handleMarkRead(n._id)}>
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="text-sm text-slate-600">{n.message}</p>
                        <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <NavLink className={navLinkClass} to="/">
              Home
            </NavLink>
            <NavLink className={navLinkClass} to="/login">
              Login
            </NavLink>
            <NavLink className={navLinkClass} to="/register">
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

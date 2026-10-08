import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  IndianRupee,
  Package,
  Receipt,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatNumber = (value = 0) => Number(value || 0).toLocaleString("en-IN");

const formatDateTime = (value) => {
  if (!value) return "Not synced yet";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function DashboardHome() {
  const [overview, setOverview] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || user?.email?.split("@")[0] || "Team";

  const fetchDashboardData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      setError("");

      const [statsResponse, analyticsResponse] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminAnalytics("month"),
      ]);

      if (!statsResponse.success || !analyticsResponse.success) {
        throw new Error("Live dashboard data could not be loaded.");
      }

      setAdminStats(statsResponse.data?.stats || null);
      setOverview(analyticsResponse.data || null);
      setLastSynced(new Date().toISOString());
    } catch (err) {
      console.error("Dashboard live data error:", err);
      setError(
        err.message ||
          "Live dashboard data is unavailable. Please check backend and database connection.",
      );
      setAdminStats(null);
      setOverview(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = window.setInterval(() => {
      fetchDashboardData({ silent: true });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const metrics = overview?.metrics || {};
  const userStats = adminStats?.users || {};
  const securityStats = adminStats?.security || {};

  const financeCards = useMemo(
    () => [
      {
        label: "Revenue",
        value: formatCurrency(metrics.revenue?.total),
        detail: `${formatCurrency(metrics.revenue?.received)} received`,
        change: metrics.revenue?.change,
        icon: IndianRupee,
        accent: "from-emerald-500 to-teal-600",
        action: () => navigate("/dashboard/analytics"),
      },
      {
        label: "Expenses",
        value: formatCurrency(metrics.expenses?.total),
        detail: `${formatCurrency(metrics.expenses?.due)} due`,
        change: metrics.expenses?.change,
        icon: Receipt,
        accent: "from-rose-500 to-orange-500",
        action: () => navigate("/dashboard/vouchers"),
        lowerIsGood: true,
      },
      {
        label: "Net Profit",
        value: formatCurrency(metrics.profit?.total),
        detail: `${metrics.profit?.margin || 0}% margin`,
        change: metrics.profit?.change,
        icon: TrendingUp,
        accent: "from-sky-500 to-blue-700",
        action: () => navigate("/dashboard/analytics"),
      },
      {
        label: "Bookings",
        value: formatNumber(metrics.bookings?.total),
        detail: `${formatCurrency(metrics.bookings?.averageValue)} avg value`,
        change: metrics.bookings?.change,
        icon: Package,
        accent: "from-violet-500 to-indigo-700",
        action: () => navigate("/dashboard/invoices"),
      },
    ],
    [metrics, navigate],
  );

  const operationCards = useMemo(
    () => [
      {
        label: "Total Users",
        value: formatNumber(userStats.total),
        detail: `${formatNumber(userStats.recentRegistrations)} new this month`,
        icon: Users,
      },
      {
        label: "Active Users",
        value: formatNumber(userStats.activeUsers),
        detail: `${formatNumber(userStats.lockedAccounts)} locked accounts`,
        icon: Activity,
      },
      {
        label: "Security Rate",
        value: `${Math.round(securityStats.successRate || 0)}%`,
        detail: `${formatNumber(securityStats.failedLogins)} failed login attempts`,
        icon: ShieldCheck,
      },
      {
        label: "Audit Events",
        value: formatNumber(securityStats.auditEvents),
        detail: `${formatNumber(securityStats.suspiciousActivities)} suspicious activities`,
        icon: BarChart3,
      },
    ],
    [securityStats, userStats],
  );

  const recentTransactions = overview?.recentTransactions || [];
  const monthlyData = overview?.monthlyData || [];
  const maxMonthly = Math.max(
    ...monthlyData.map((item) =>
      Math.max(Number(item.revenue || 0), Number(item.expenses || 0)),
    ),
    1,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-40 animate-pulse bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#071c23] p-6 text-white shadow-[0_24px_80px_rgba(7,28,35,0.18)] sm:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(232,184,92,0.28),transparent_28%),linear-gradient(135deg,rgba(11,74,66,0.72),transparent_46%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-soft-gold">
              Welcome
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
              {getGreeting()}, {userName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">
              Live corporate dashboard for revenue, expenses, bookings, users
              and operational health across the current month.
            </p>
            {error && (
              <div className="mt-5 flex max-w-2xl items-start gap-3 border border-red-300/30 bg-red-500/15 p-4 text-sm text-red-50">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="border border-white/14 bg-white/10 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/66">
                <CalendarClock className="h-4 w-4 text-soft-gold" />
                Live sync
              </div>
              <p className="mt-1 text-sm font-semibold">
                {formatDateTime(lastSynced || overview?.lastUpdated)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchDashboardData({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-soft-gold px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#071c23] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </motion.section>

      {!overview || !adminStats ? (
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-9 w-9 text-amber-500" />
          <h2 className="font-serif text-2xl text-[#071c23]">
            Live data is not connected
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Start the backend with a working MongoDB connection to see real
            dashboard numbers here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {financeCards.map((card, index) => {
              const Icon = card.icon;
              const change = Number(card.change || 0);
              const positive = card.lowerIsGood ? change <= 0 : change >= 0;
              const TrendIcon = positive ? TrendingUp : TrendingDown;

              return (
                <motion.button
                  key={card.label}
                  type="button"
                  onClick={card.action}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="group bg-white p-5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center bg-gradient-to-br ${card.accent} text-white shadow-lg`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        positive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      <TrendIcon className="h-4 w-4" />
                      {Math.abs(change)}%
                    </div>
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {card.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="text-2xl font-black text-[#071c23]">
                      {card.value}
                    </h3>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-[#0b4a42]" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
                </motion.button>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {operationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center bg-[#edf6f8] text-[#0b4a42]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                        {card.label}
                      </p>
                      <p className="text-2xl font-black text-[#071c23]">
                        {card.value}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">{card.detail}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b4a42]">
                    Current period
                  </p>
                  <h2 className="font-serif text-2xl text-[#071c23]">
                    Revenue vs Expense Flow
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/analytics")}
                  className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 hover:text-[#071c23]"
                >
                  Analytics
                </button>
              </div>

              {monthlyData.length > 0 ? (
                <div className="space-y-5">
                  {monthlyData.map((item) => (
                    <div key={item.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-700">
                          {item.month}
                        </span>
                        <span className="text-slate-500">
                          Profit {formatCurrency(item.profit)}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                            <span>Revenue</span>
                            <span>{formatCurrency(item.revenue)}</span>
                          </div>
                          <div className="h-2 bg-slate-100">
                            <div
                              className="h-full bg-emerald-500"
                              style={{
                                width: `${Math.min(
                                  (Number(item.revenue || 0) / maxMonthly) *
                                    100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-rose-600">
                            <span>Expense</span>
                            <span>{formatCurrency(item.expenses)}</span>
                          </div>
                          <div className="h-2 bg-slate-100">
                            <div
                              className="h-full bg-rose-500"
                              style={{
                                width: `${Math.min(
                                  (Number(item.expenses || 0) / maxMonthly) *
                                    100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  No monthly finance data found.
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b4a42]">
                    Live ledger
                  </p>
                  <h2 className="font-serif text-2xl text-[#071c23]">
                    Recent Transactions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/invoices")}
                  className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 hover:text-[#071c23]"
                >
                  Open
                </button>
              </div>

              <div className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => {
                    const amount = Number(transaction.amount || 0);
                    const isRevenue = amount >= 0;
                    return (
                      <div
                        key={`${transaction.reference || transaction.description}-${index}`}
                        className="flex items-center justify-between gap-4 border border-slate-100 bg-slate-50/70 p-4"
                      >
                        <div>
                          <p className="font-semibold text-[#071c23]">
                            {transaction.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {transaction.reference || "No reference"} ·{" "}
                            {formatDateTime(transaction.date)}
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-sm font-black ${
                            isRevenue ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isRevenue ? "+" : "-"}
                          {formatCurrency(Math.abs(amount))}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    No recent invoices or vouchers found.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardHome;

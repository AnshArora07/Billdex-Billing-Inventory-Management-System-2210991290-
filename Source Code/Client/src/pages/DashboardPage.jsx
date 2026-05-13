import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import { dashboardService } from "../services/api";
import { getUser } from "../utils/auth";
import { useToast } from "../components/Toast";

export default function DashboardPage() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch fresh user data from MongoDB
        const userData = await getUser();
        setUser(userData);

        // Fetch dashboard stats
        const { data } = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        toast.error("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  return (
    <DashboardLayout>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{user?.organisationName}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Products" value={stats.totalProducts} icon="📦" color="blue" />
            <StatCard label="Total Bills"    value={stats.totalBills}    icon="🧾" color="purple" />
            <StatCard label="Total Revenue"  value={fmt(stats.totalRevenue)} icon="💰" color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent bills */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Recent Bills</h2>
                <Link to="/sales" className="text-xs text-brand-600 hover:underline">View all →</Link>
              </div>
              {stats.recentBills.length === 0 ? (
                <p className="text-sm text-gray-400 p-5">No bills yet.</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Bill #</th>
                      <th className="th">Customer</th>
                      <th className="th">Date</th>
                      <th className="th">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentBills.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50">
                        <td className="td font-mono text-xs text-gray-500">#{b.billNumber}</td>
                        <td className="td text-gray-700">{b.customerName}</td>
                        <td className="td text-gray-500">{fmtDate(b.createdAt)}</td>
                        <td className="td font-medium text-gray-900">{fmt(b.finalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Low stock warning */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Low Stock Alert</h2>
                <Link to="/products" className="text-xs text-brand-600 hover:underline">Manage →</Link>
              </div>
              {stats.lowStockProducts.length === 0 ? (
                <div className="p-5 text-center">
                  <p className="text-2xl mb-1">✅</p>
                  <p className="text-sm text-gray-400">All products are well-stocked.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th">Product</th>
                      <th className="th">Qty Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.lowStockProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="td text-gray-700">{p.name}</td>
                        <td className="td">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            p.quantity === 0
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {p.quantity === 0 ? "Out of stock" : `${p.quantity} left`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Quick actions */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/products" className="btn-secondary flex items-center gap-2">
              <span>📦</span> Add Product
            </Link>
            <Link to="/billing" className="btn-primary flex items-center gap-2">
              <span>🧾</span> Create Bill
            </Link>
          </div>
        </>
      ) : (
        <div className="card p-6 text-sm text-gray-500">No dashboard data available.</div>
      )}
    </DashboardLayout>
  );
}

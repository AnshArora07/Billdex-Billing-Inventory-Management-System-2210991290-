import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { billService } from "../services/api";
import { useToast } from "../components/Toast";

const PAYMENT_ICONS = { cash: "💵", upi: "📱", card: "💳", other: "💰" };

export default function SalesPage() {
  const toast = useToast();

  const [bills, setBills]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search,     setSearch]     = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [dateFrom,   setDateFrom]   = useState("");   // "YYYY-MM-DD"
  const [dateTo,     setDateTo]     = useState("");

  useEffect(() => {
    billService.getAll()
      .then(({ data }) => setBills(data.bills || []))
      .catch(() => toast.error("Failed to load sales history."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived: apply all filters ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      // Text search — bill number or customer name
      if (search) {
        const q = search.toLowerCase();
        const matchNum  = String(b.billNumber).includes(q);
        const matchName = b.customerName?.toLowerCase().includes(q);
        if (!matchNum && !matchName) return false;
      }

      // Payment mode
      if (filterMode !== "all" && b.paymentMode !== filterMode) return false;

      // Date range
      if (dateFrom) {
        const billDate = new Date(b.createdAt).setHours(0, 0, 0, 0);
        const from     = new Date(dateFrom).setHours(0, 0, 0, 0);
        if (billDate < from) return false;
      }
      if (dateTo) {
        const billDate = new Date(b.createdAt).setHours(23, 59, 59, 999);
        const to       = new Date(dateTo).setHours(23, 59, 59, 999);
        if (billDate > to) return false;
      }

      return true;
    });
  }, [bills, search, filterMode, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch(""); setFilterMode("all"); setDateFrom(""); setDateTo("");
  };
  const hasActiveFilter = search || filterMode !== "all" || dateFrom || dateTo;

  // ── Derived stats from filtered set ─────────────────────────────────────────
  const totalRevenue = filtered.reduce((s, b) => s + (b.finalAmount || 0), 0);
  const avgBill      = filtered.length ? totalRevenue / filtered.length : 0;
  const topMode      = (() => {
    const counts = {};
    filtered.forEach((b) => counts[b.paymentMode] = (counts[b.paymentMode] || 0) + 1);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "—";
  })();

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleDeleteBill = async (bill) => {
    const ok = window.confirm(`Delete bill ${bill.billNumber}? Stock will be restored.`);
    if (!ok) return;

    try {
      await billService.remove(bill._id);
      setBills((prev) => prev.filter((b) => b._id !== bill._id));
      setExpandedId((prev) => (prev === bill._id ? null : prev));
      toast.success("Bill deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete bill.");
    }
  };

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sales History</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {hasActiveFilter
              ? `${filtered.length} of ${bills.length} bills`
              : `${bills.length} bill${bills.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link to="/billing" className="btn-primary self-start">+ New Bill</Link>
      </div>

      {/* Summary strip */}
      {!loading && bills.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Bills",         value: filtered.length },
            { label: "Revenue",       value: fmt(totalRevenue) },
            { label: "Average bill",  value: fmt(avgBill) },
            { label: "Top payment",   value: `${PAYMENT_ICONS[topMode] || ""} ${topMode}` },
          ].map((s) => (
            <div key={s.label} className="card px-4 py-3">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {bills.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          {/* Search */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Search</label>
            <input
              className="input w-52"
              placeholder="Bill # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Payment mode */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Payment</label>
            <select className="input w-36" value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
              <option value="all">All modes</option>
              <option value="cash">💵 Cash</option>
              <option value="upi">📱 UPI</option>
              <option value="card">💳 Card</option>
              <option value="other">💰 Other</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              className="input w-40"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              className="input w-40"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="self-end text-xs text-gray-400 hover:text-red-500 transition px-2 py-2"
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : bills.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm text-gray-500 mb-4">No bills yet.</p>
            <Link to="/billing" className="btn-primary">Create your first bill →</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm text-gray-400 mb-3">No bills match your filters.</p>
            <button onClick={clearFilters} className="text-sm text-brand-600 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="th">Bill #</th>
                  <th className="th">Customer</th>
                  <th className="th">Date & Time</th>
                  <th className="th">Items</th>
                  <th className="th">Payment</th>
                  <th className="th">Amount</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((bill) => (
                  <>
                    {/* Main row */}
                    <tr
                      key={bill._id}
                      onClick={() => setExpandedId(expandedId === bill._id ? null : bill._id)}
                      className={`cursor-pointer transition-colors ${
                        expandedId === bill._id ? "bg-brand-50/40" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <td className="td">
                        <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          #{bill.billNumber || bill._id.slice(-4).toUpperCase()}
                        </span>
                      </td>
                      <td className="td font-medium text-gray-800">
                        {bill.customerName || "Walk-in Customer"}
                      </td>
                      <td className="td">
                        <p className="text-gray-700">{fmtDate(bill.createdAt)}</p>
                        <p className="text-xs text-gray-400">{fmtTime(bill.createdAt)}</p>
                      </td>
                      <td className="td text-gray-500">
                        {bill.items?.length || 0} item{bill.items?.length !== 1 ? "s" : ""}
                      </td>
                      <td className="td">
                        <span className="capitalize text-sm text-gray-600 flex items-center gap-1.5">
                          <span>{PAYMENT_ICONS[bill.paymentMode] || "💰"}</span>
                          {bill.paymentMode || "cash"}
                        </span>
                      </td>
                      <td className="td">
                        <p className="font-semibold text-gray-900">{fmt(bill.finalAmount)}</p>
                        {bill.discount > 0 && (
                          <p className="text-xs text-red-400">−{bill.discount}% disc.</p>
                        )}
                      </td>
                      <td className="td text-xs font-medium text-gray-400">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBill(bill);
                            }}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                          <span>{expandedId === bill._id ? "▲" : "▼"}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {expandedId === bill._id && (
                      <tr key={`${bill._id}-detail`}>
                        <td colSpan={7} className="bg-brand-50/60 px-6 py-5 border-b border-brand-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">

                            {/* Line items */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-gray-400">
                                    <th className="text-left pb-1.5 font-medium pr-3">Product</th>
                                    <th className="text-right pb-1.5 font-medium pr-3">Qty</th>
                                    <th className="text-right pb-1.5 font-medium pr-3">Price</th>
                                    <th className="text-right pb-1.5 font-medium">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-100/60">
                                  {bill.items.map((item, idx) => (
                                    <tr key={idx}>
                                      <td className="py-1.5 pr-3 text-gray-700">{item.product?.name || "—"}</td>
                                      <td className="py-1.5 pr-3 text-gray-500 text-right">{item.quantity}</td>
                                      <td className="py-1.5 pr-3 text-gray-500 text-right">₹{item.price}</td>
                                      <td className="py-1.5 text-gray-800 font-medium text-right">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Charges */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Charges</p>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between text-gray-500">
                                  <span>Subtotal</span>
                                  <span>₹{bill.totalAmount?.toFixed(2)}</span>
                                </div>
                                {bill.discount > 0 && (
                                  <div className="flex justify-between text-red-500">
                                    <span>Discount ({bill.discount}%)</span>
                                    <span>−₹{((bill.totalAmount * bill.discount) / 100).toFixed(2)}</span>
                                  </div>
                                )}
                                {bill.gst > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>GST ({bill.gst}%)</span>
                                    <span>+₹{(((bill.totalAmount - (bill.totalAmount * bill.discount) / 100) * bill.gst) / 100).toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                                  <span>Total Paid</span>
                                  <span>{fmt(bill.finalAmount)}</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

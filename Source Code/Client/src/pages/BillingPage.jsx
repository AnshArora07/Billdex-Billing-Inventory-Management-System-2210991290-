import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { productService, billService, draftService } from "../services/api";
import { useToast } from "../components/Toast";

const PAYMENT_MODES = [
  { value: "cash",  label: "Cash" },
  { value: "upi",   label: "UPI" },
  { value: "card",  label: "Card" },
  { value: "other", label: "Other" },
];

export default function BillingPage() {
  const toast = useToast();
  const [products, setProducts]       = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Current item being added
  const [selectedId, setSelectedId]   = useState("");
  const [qty, setQty]                 = useState(1);

  // Bill state — Now fetched from MongoDB drafts instead of localStorage
  const [items, setItems]             = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discount, setDiscount]       = useState("");
  const [gst, setGst]                 = useState("");
  const [draftId, setDraftId]         = useState(null);

  // UI state
  const [submitting, setSubmitting]   = useState(false);
  const [lastBill, setLastBill]       = useState(null); // show success panel
  const [savingDraft, setSavingDraft] = useState(false);

  // ── Load products ──────────────────────────────────────────────────────────
  useEffect(() => {
    productService.getAll()
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => toast.error("Failed to load products. Make sure the backend is running."))
      .finally(() => setLoadingProducts(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load draft from MongoDB on mount ───────────────────────────────────────
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const { data } = await draftService.getAll();
        if (data.length > 0) {
          const draft = data[0]; // Get the latest draft
          setDraftId(draft._id);
          setCustomerName(draft.customerName || "");
          setItems(draft.items || []);
          setDiscount(draft.discount || "");
          setGst(draft.gst || "");
        }
      } catch (err) {
        console.log("No existing draft found");
      }
    };
    loadDraft();
  }, []);

  // ── Auto-save draft to MongoDB on changes ──────────────────────────────────
  useEffect(() => {
    const autoSaveDraft = async () => {
      if (!customerName && items.length === 0) return; // Don't save empty drafts

      setSavingDraft(true);
      try {
        const draftData = {
          customerName: customerName || "",
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          discount: Number(discount) || 0,
          gst: Number(gst) || 0,
          subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
        };

        if (draftId) {
          // Update existing draft
          await draftService.update(draftId, draftData);
        } else {
          // Create new draft
          const { data } = await draftService.create(draftData);
          setDraftId(data._id);
        }
      } catch (err) {
        console.error("Failed to save draft:", err);
      } finally {
        setSavingDraft(false);
      }
    };

    const timer = setTimeout(autoSaveDraft, 500); // Debounce saves
    return () => clearTimeout(timer);
  }, [items, customerName, discount, gst, draftId]);

  // ── Selected product object ────────────────────────────────────────────────
  const selectedProduct = products.find((p) => p._id === selectedId);

  // ── Add item to bill ───────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedProduct) return;

    const addQty = Number(qty);
    if (addQty < 1) return;

    // Guard: don't allow more than available stock
    const alreadyAdded = items.find((i) => i.productId === selectedId)?.quantity || 0;
    if (alreadyAdded + addQty > selectedProduct.quantity) {
      toast.warning(`Only ${selectedProduct.quantity} units of "${selectedProduct.name}" in stock (${alreadyAdded} already added).`);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === selectedId);
      if (existing) {
        return prev.map((i) =>
          i.productId === selectedId ? { ...i, quantity: i.quantity + addQty } : i
        );
      }
      return [
        ...prev,
        {
          productId: selectedProduct._id,
          name:      selectedProduct.name,
          category:  selectedProduct.category,
          price:     selectedProduct.sellingPrice,
          stock:     selectedProduct.quantity,
          quantity:  addQty,
        },
      ];
    });

    setSelectedId("");
    setQty(1);
  };

  // Allow Enter key in qty field to add item
  const handleQtyKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddItem(); }
  };

  // ── Update qty inline in bill table ───────────────────────────────────────
  const handleQtyChange = (productId, newQty) => {
    const n = Number(newQty);
    if (n < 1) return;
    const item = items.find((i) => i.productId === productId);
    if (n > item.stock) {
      toast.warning(`Max stock for "${item.name}" is ${item.stock}.`);
      return;
    }
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: n } : i));
  };

  const handleRemoveItem = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const resetBill = async () => {
    // Clear draft from MongoDB if it exists
    if (draftId) {
      try {
        await draftService.remove(draftId);
      } catch (err) {
        console.error("Failed to delete draft:", err);
      }
    }
    // Reset UI state
    setItems([]);
    setCustomerName("");
    setPaymentMode("cash");
    setDiscount("");
    setGst("");
    setLastBill(null);
    setDraftId(null);
  };

  // ── Derived totals ─────────────────────────────────────────────────────────
  const discountPct   = Number(discount) || 0;
  const gstPct        = Number(gst)      || 0;
  const subtotal      = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmt   = (subtotal * discountPct) / 100;
  const afterDiscount = subtotal - discountAmt;
  const gstAmt        = (afterDiscount * gstPct) / 100;
  const finalAmount   = afterDiscount + gstAmt;

  // ── Submit bill ────────────────────────────────────────────────────────────
  const handleGenerateBill = async () => {
    if (items.length === 0) { toast.warning("Add at least one product to the bill."); return; }
    setSubmitting(true);
    try {
      const { data } = await billService.create({
        customerName: customerName.trim() || "Walk-in Customer",
        paymentMode,
        items:    items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        discount: discountPct,
        gst:      gstPct,
      });
      setLastBill(data.bill);
      // Delete draft after bill is created
      if (draftId) {
        await draftService.remove(draftId);
      }
      resetBill();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bill. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success / receipt panel ────────────────────────────────────────────────
  if (lastBill) {
    const afterDisc = lastBill.totalAmount - (lastBill.totalAmount * lastBill.discount) / 100;
    const gstAmt    = (afterDisc * lastBill.gst) / 100;

    const printReceipt = () => {
      const w = window.open("", "_blank", "width=420,height=600");
      w.document.write(`
        <html><head><title>Bill #${lastBill.billNumber}</title>
        <style>
          body { font-family: monospace; font-size: 13px; padding: 24px; color: #111; }
          h2   { text-align: center; margin-bottom: 4px; }
          p    { text-align: center; color: #555; margin: 2px 0; }
          hr   { border: none; border-top: 1px dashed #aaa; margin: 12px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .total { font-weight: bold; font-size: 15px; }
        </style></head><body>
        <h2><span style="color:#2563eb">Bill</span><span style="color:#111827">Dex</span></h2>
        <p>Receipt</p>
        <hr/>
        <div class="row"><span>Bill #</span><span>${lastBill.billNumber}</span></div>
        <div class="row"><span>Customer</span><span>${lastBill.customerName}</span></div>
        <div class="row"><span>Payment</span><span>${lastBill.paymentMode.toUpperCase()}</span></div>
        <div class="row"><span>Date</span><span>${new Date(lastBill.createdAt).toLocaleDateString("en-IN")}</span></div>
        <hr/>
        ${lastBill.items.map(i => `
          <div class="row">
            <span>${i.product?.name} × ${i.quantity}</span>
            <span>₹${(i.price * i.quantity).toFixed(2)}</span>
          </div>`).join("")}
        <hr/>
        <div class="row"><span>Subtotal</span><span>₹${lastBill.totalAmount.toFixed(2)}</span></div>
        ${lastBill.discount > 0 ? `<div class="row"><span>Discount (${lastBill.discount}%)</span><span>-₹${((lastBill.totalAmount * lastBill.discount) / 100).toFixed(2)}</span></div>` : ""}
        ${lastBill.gst > 0 ? `<div class="row"><span>GST (${lastBill.gst}%)</span><span>+₹${gstAmt.toFixed(2)}</span></div>` : ""}
        <hr/>
        <div class="row total"><span>TOTAL PAID</span><span>₹${lastBill.finalAmount.toFixed(2)}</span></div>
        <hr/>
        <p style="margin-top:16px">Thank you for your purchase!</p>
        </body></html>
      `);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); w.close(); }, 300);
    };

    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-8">
          <div className="card p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Bill #{lastBill.billNumber} Created</h2>
            <p className="text-sm text-gray-500 mb-1">
              Customer: <span className="font-medium text-gray-700">{lastBill.customerName}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Payment: <span className="font-medium text-gray-700 capitalize">{lastBill.paymentMode}</span>
            </p>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
              {lastBill.items.map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600">
                  <span>{item.product?.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 space-y-1">
                {lastBill.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount ({lastBill.discount}%)</span>
                    <span>−₹{((lastBill.totalAmount * lastBill.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                {lastBill.gst > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>GST ({lastBill.gst}%)</span>
                    <span>+₹{gstAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 text-base pt-1">
                  <span>Total Paid</span>
                  <span>₹{lastBill.finalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <button onClick={resetBill}  className="btn-primary flex-1">+ New Bill</button>
                <Link to="/sales" className="btn-secondary flex-1 text-center">View Sales</Link>
              </div>
              <button
                onClick={printReceipt}
                className="w-full text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                🖨 Print Receipt
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main billing form ──────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Bill</h1>
        <p className="text-sm text-gray-400 mt-0.5">Add products, set charges, generate bill</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Customer info row */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
                <select
                  className="input"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product selector */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Product</p>

            {loadingProducts ? (
              <p className="text-sm text-gray-400">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-gray-400">
                No products found.{" "}
                <Link to="/products" className="text-brand-600 hover:underline">Add products first →</Link>
              </p>
            ) : (
              <div className="flex gap-3 flex-wrap items-end">
                {/* Product dropdown */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                  <select
                    className="input"
                    value={selectedId}
                    onChange={(e) => { setSelectedId(e.target.value); setQty(1); }}
                  >
                    <option value="">— Select a product —</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                        {p.name} — ₹{p.sellingPrice}
                        {p.quantity === 0 ? " (out of stock)" : ` (${p.quantity} in stock)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty input */}
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    onKeyDown={handleQtyKeyDown}
                    disabled={!selectedId}
                  />
                </div>

                <button
                  onClick={handleAddItem}
                  disabled={!selectedId}
                  className="btn-primary self-end whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
            )}

            {/* Selected product preview */}
            {selectedProduct && (
              <div className="mt-3 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-700 flex items-center gap-3">
                <span className="font-medium">{selectedProduct.name}</span>
                <span>₹{selectedProduct.sellingPrice} each</span>
                <span className="text-brand-500">{selectedProduct.quantity} in stock</span>
                {qty > 1 && (
                  <span className="ml-auto font-semibold">
                    = ₹{(selectedProduct.sellingPrice * Number(qty)).toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Items table */}
          <div className="card overflow-hidden">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-sm text-gray-400">No items added yet.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="th">Product</th>
                        <th className="th">Unit Price</th>
                        <th className="th">Qty</th>
                        <th className="th">Total</th>
                        <th className="th"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map((item) => (
                        <tr key={item.productId} className="hover:bg-gray-50/60">
                          <td className="td">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.category && (
                              <p className="text-xs text-gray-400">{item.category}</p>
                            )}
                          </td>
                          <td className="td text-gray-600">₹{item.price}</td>
                          <td className="td">
                            {/* Inline editable qty */}
                            <input
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.productId, e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
                            />
                          </td>
                          <td className="td font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="td">
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-gray-300 hover:text-red-500 transition text-lg leading-none"
                              title="Remove item"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-xs text-gray-500">
                          {items.length} product{items.length !== 1 ? "s" : ""} · {items.reduce((s, i) => s + i.quantity, 0)} units total
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          ₹{subtotal.toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Bill Summary ── */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-3">
              Bill Summary
            </p>

            {/* Discount */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount (%)</label>
              <input
                className="input"
                type="number" min="0" max="100"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            {/* GST */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GST (%)</label>
              <input
                className="input"
                type="number" min="0"
                placeholder="0"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
              />
            </div>

            {/* Amount breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount ({discountPct}%)</span>
                  <span>−₹{discountAmt.toFixed(2)}</span>
                </div>
              )}
              {gstPct > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>GST ({gstPct}%)</span>
                  <span>+₹{gstAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 text-base">
                <span>Total</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleGenerateBill}
              disabled={submitting || items.length === 0}
              className="btn-primary w-full py-2.5"
            >
              {submitting ? "Generating…" : "Generate Bill →"}
            </button>

            {items.length > 0 && (
              <button
                onClick={resetBill}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition py-1"
              >
                Clear bill
              </button>
            )}
          </div>

          {/* Payment mode badge */}
          <div className="card p-4 flex items-center gap-3">
            <div className="text-xl">
              {paymentMode === "cash" ? "💵" : paymentMode === "upi" ? "📱" : paymentMode === "card" ? "💳" : "💰"}
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment mode</p>
              <p className="text-sm font-medium text-gray-700 capitalize">{paymentMode}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

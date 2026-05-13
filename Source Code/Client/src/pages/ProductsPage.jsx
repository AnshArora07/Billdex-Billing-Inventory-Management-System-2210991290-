import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Modal from "../components/Modal";
import { productService } from "../services/api";
import { useToast } from "../components/Toast";

const EMPTY = { name: "", category: "", mrp: "", sellingPrice: "", quantity: "" };

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const [showModal, setShowModal]     = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productService.getAll(search);
      setProducts(data.products || []);
    } catch {
      // silently handled — table shows empty state
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, category: p.category || "", mrp: p.mrp, sellingPrice: p.sellingPrice, quantity: p.quantity });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProduct(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editProduct) {
        await productService.update(editProduct._id, form);
        toast.success("Product updated.");
      } else {
        const { data } = await productService.create(form);
        toast.success(data?.message || "Product added.");
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productService.remove(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success(`"${name}" deleted.`);
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const productNameOptions = [...new Set(products.map((p) => p.name).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  const categoryOptions = [...new Set(products.map((p) => p.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const margin = (p) => {
    if (!p.mrp || !p.sellingPrice) return null;
    return (((p.sellingPrice - p.mrp) / p.mrp) * 100).toFixed(0);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} item{products.length !== 1 ? "s" : ""} in inventory</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Product</button>
      </div>

      {/* Search bar */}
      <div className="mb-4 max-w-sm">
        <input
          className="input"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm text-gray-400">
              {search ? `No products found for "${search}".` : "No products yet. Click + Add Product to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="th">Product</th>
                  <th className="th">Category</th>
                  <th className="th">MRP (₹)</th>
                  <th className="th">Selling (₹)</th>
                  <th className="th">Stock</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const m = margin(p);
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="td font-medium text-gray-800">{p.name}</td>
                      <td className="td">
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                          {p.category || "General"}
                        </span>
                      </td>
                      <td className="td text-gray-500 line-through">₹{p.mrp}</td>
                      <td className="td">
                        <span className="font-medium text-gray-800">₹{p.sellingPrice}</span>
                        {m !== null && Number(m) < 0 && (
                          <span className="ml-1.5 text-xs text-green-600">({Math.abs(m)}% off)</span>
                        )}
                      </td>
                      <td className="td">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          p.quantity === 0
                            ? "bg-red-100 text-red-600"
                            : p.quantity <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {p.quantity === 0 ? "Out of stock" : p.quantity}
                        </span>
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(p)}  className="text-xs text-brand-600 hover:underline font-medium">Edit</button>
                          <button onClick={() => handleDelete(p._id, p.name)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editProduct ? "Edit Product" : "Add Product"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
            )}
            {[
              { label: "Product Name *",   name: "name",         type: "text",   ph: "e.g. USB Cable", list: !editProduct ? "product-name-options" : undefined },
              { label: "Category",         name: "category",     type: "text",   ph: "e.g. Accessories", list: !editProduct ? "category-options" : undefined },
              { label: "MRP (₹) *",        name: "mrp",          type: "number", ph: "299" },
              { label: "Selling Price (₹) *", name: "sellingPrice", type: "number", ph: "249" },
              { label: "Stock Quantity",   name: "quantity",     type: "number", ph: "50" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input
                  className="input" type={f.type} name={f.name}
                  value={form[f.name]} onChange={change} placeholder={f.ph}
                  list={f.list}
                  min={f.type === "number" ? 0 : undefined}
                  required={f.label.includes("*")}
                />
              </div>
            ))}
            {!editProduct && (
              <>
                <datalist id="product-name-options">
                  {productNameOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <datalist id="category-options">
                  {categoryOptions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </>
            )}
            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-primary flex-1" disabled={saving}>
                {saving ? "Saving…" : editProduct ? "Save Changes" : "Add Product"}
              </button>
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

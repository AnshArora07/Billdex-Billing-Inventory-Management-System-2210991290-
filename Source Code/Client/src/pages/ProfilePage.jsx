import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { authService } from "../services/api";
import { useToast } from "../components/Toast";

const EMPTY = { name: "", organisationName: "", email: "" };

export default function ProfilePage() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await authService.getMe();
        setForm({
          name: data.user?.name || "",
          organisationName: data.user?.organisationName || "",
          email: data.user?.email || "",
        });
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  // Run only once on mount; prevents form values from resetting while typing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({
        name: form.name,
        organisationName: form.organisationName,
      });

      setForm((prev) => ({
        ...prev,
        name: data.user?.name || prev.name,
        organisationName: data.user?.organisationName || prev.organisationName,
      }));

      toast.success(data?.message || "Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Update your business profile details here.
          </p>
        </div>

        <div className="card p-6 sm:p-7">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={change}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Organisation Name</label>
                <input
                  className="input"
                  name="organisationName"
                  value={form.organisationName}
                  onChange={change}
                  placeholder="Your business name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email (read-only)</label>
                <input className="input bg-gray-50 text-gray-500" value={form.email} readOnly disabled />
              </div>

              <div className="pt-1">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

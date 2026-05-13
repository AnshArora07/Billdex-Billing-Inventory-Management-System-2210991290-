// Health check to verify backend is running
export const checkBackendHealth = async () => {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const healthUrl = apiBase.replace("/api", ""); // Remove /api to hit root

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend is healthy:", data);
      return true;
    } else {
      console.warn("⚠️ Backend returned non-200 status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Backend health check failed:", {
      apiBase,
      error: error.message,
    });
    return false;
  }
};

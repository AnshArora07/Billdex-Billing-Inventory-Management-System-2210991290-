import { useState, useCallback } from "react";

/**
 * Generic hook for API calls.
 * Handles loading, error, and data state in one place.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(productService.getAll);
 *   useEffect(() => { execute(); }, []);
 *
 * With arguments:
 *   const { execute: saveProduct } = useApi(productService.create);
 *   await saveProduct({ name: "USB Cable", ... });
 */
export function useApi(apiFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;          // also return it for callers that await execute()
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setError(msg);
      throw err;                // re-throw so callers can catch too if needed
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute, setData };
}

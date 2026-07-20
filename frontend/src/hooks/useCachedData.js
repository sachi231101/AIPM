import { useState, useEffect, useCallback, useRef } from "react";

// In-memory cache store
const apiCache = {};

/**
 * A custom hook to fetch and cache API data using the Stale-While-Revalidate pattern.
 *
 * @param {string} cacheKey - The unique key identifying the cached data.
 * @param {Function} fetchFunction - An async function that makes the API request.
 * @param {Array} dependencies - Dependency array to trigger refetch when changed.
 */
export function useCachedData(cacheKey, fetchFunction, dependencies = []) {
  const [data, setData] = useState(() => apiCache[cacheKey] || null);
  const [loading, setLoading] = useState(!apiCache[cacheKey]);
  const [error, setError] = useState(null);

  // Keep a ref of the fetchFunction to avoid triggering hook updates if they are anonymous functions
  const fetchFnRef = useRef(fetchFunction);
  useEffect(() => {
    fetchFnRef.current = fetchFunction;
  }, [fetchFunction]);

  const refresh = useCallback(async (showLoader = false) => {
    try {
      if (showLoader || !apiCache[cacheKey]) {
        setLoading(true);
      }
      const res = await fetchFnRef.current();
      apiCache[cacheKey] = res.data;
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(`Error fetching cached data for key "${cacheKey}":`, err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    refresh();
  }, [cacheKey, ...dependencies]);

  return {
    data,
    loading,
    error,
    refresh,
    setData: (value) => {
      setData((prev) => {
        const resolved = typeof value === "function" ? value(prev) : value;
        apiCache[cacheKey] = resolved;
        return resolved;
      });
    }
  };
}

/**
 * Clear a specific cache key or the entire cache.
 * Useful for logging out or full resets.
 *
 * @param {string} [cacheKey] - The cache key to clear. If omitted, clears the whole cache.
 */
export function clearCache(cacheKey) {
  if (cacheKey) {
    delete apiCache[cacheKey];
  } else {
    Object.keys(apiCache).forEach((k) => delete apiCache[k]);
  }
}

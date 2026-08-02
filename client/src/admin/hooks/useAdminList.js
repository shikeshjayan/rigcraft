import { useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useToast } from "../components/common/Toast";
import { extractError } from "../utils/extractError";

/**
 * useAdminList — TanStack Query wrapper for admin list pages.
 *
 * @param {string} queryKey  - Stable key prefix (e.g. 'brandList').
 * @param {object} service   - Service object whose `.list(params)` returns `{ data, total }`.
 * @param {object} params    - `{ page, pageSize, search, ...filters }`.
 * @param {object} options   - Extra useQuery options. Pass `skipErrorToast: true` to suppress auto-toast.
 *
 * @returns {{ data: Array, total: number, loading: boolean, isFetching: boolean, error: Error, refetch: Function }}
 */
export const useAdminList = (queryKey, service, params = {}, options = {}) => {
  const { toast } = useToast();

  const {
    data: result,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => service.list(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: 1,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),
    ...options,
  });

  useEffect(() => {
    if (error && !options.skipErrorToast) {
      toast(extractError(error, "Failed to load data"), "error");
    }
  }, [error, toast, options.skipErrorToast]);

  return {
    data: result?.data || [],
    total: result?.total || 0,
    loading,
    isFetching,
    error,
    refetch,
  };
};

export default useAdminList;

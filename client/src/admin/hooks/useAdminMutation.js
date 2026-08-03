import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/common/Toast";
import { extractError } from "../utils/extractError";

/**
 * useAdminMutation — TanStack Query wrapper for admin CRUD mutations.
 *
 * @param {Function} mutationFn  - e.g. (data) => userService.create(data).
 * @param {object} options:
 *   - {string|string[]} [queryKey]   - Invalidate these queries on success.
 *   - {string} [successMessage]      - Auto-toast on success (default: "Done").
 *   - {boolean} [skipSuccessToast]   - Suppress success toast.
 *   - {Function} [onSuccess]          - Called with (data, variables) after invalidation.
 *   - {Function} [onError]           - Called with (err, variables).
 *
 * @returns {object} The useMutation result (mutate, mutateAsync, isPending, etc.).
 */
export const useAdminMutation = (mutationFn, options = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options.queryKey) {
        const keys = Array.isArray(options.queryKey)
          ? options.queryKey
          : [options.queryKey];
        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
      if (!options.skipSuccessToast) {
        toast(options.successMessage || "Done");
      }
      if (options.onSuccess) options.onSuccess(data, variables);
    },
    onError: (err, variables) => {
      toast(extractError(err, "An error occurred"), "error");
      if (options.onError) options.onError(err, variables);
    },
  });
};

export default useAdminMutation;

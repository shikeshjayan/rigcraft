export const extractError = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message || e)).join("; ");
  }
  if (data?.message) return data.message;
  if (err?.message) return err.message;
  return fallback;
};

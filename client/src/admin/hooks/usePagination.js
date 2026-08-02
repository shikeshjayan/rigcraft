import { useState, useMemo, useCallback } from "react";

const ROWS_PER_PAGE_KEY = "adminRowsPerPage";

const readStoredRowsPerPage = () => {
  try {
    const raw = localStorage.getItem(ROWS_PER_PAGE_KEY);
    if (raw === null) return null;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? Math.floor(num) : null;
  } catch {
    return null;
  }
};

const persistRowsPerPage = (size) => {
  try {
    localStorage.setItem(ROWS_PER_PAGE_KEY, String(size));
  } catch {
    // localStorage unavailable (e.g. private mode) — persistence is best-effort.
  }
};

export const usePagination = (data = [], pageSize = 10) => {
  const [page, setPageState] = useState(0);
  const [manualSize, setManualSize] = useState(() => readStoredRowsPerPage());

  const rowsPerPage =
    manualSize !== null
      ? manualSize
      : Number.isFinite(pageSize) && pageSize > 0
        ? Math.floor(pageSize)
        : 10;

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Accepts either a raw page number (setPage(0)) or MUI's (event, newPage).
  const setPage = useCallback((value, maybeNewPage) => {
    const next = typeof value === "number" ? value : maybeNewPage;
    if (Number.isFinite(next)) setPageState(Math.max(0, Math.floor(next)));
  }, []);

  const applyRowsPerPage = useCallback((next) => {
    const size = typeof next === "number" ? next : parseInt(next?.target?.value, 10);
    if (!Number.isFinite(size) || size <= 0) return;
    setManualSize(size);
    setPageState(0);
    persistRowsPerPage(size);
  }, []);

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => applyRowsPerPage(event);

  const setPageSize = useCallback((size) => {
    applyRowsPerPage(size);
  }, [applyRowsPerPage]);

  const resetPage = () => setPageState(0);

  return {
    page,
    rowsPerPage,
    pageSize: rowsPerPage,
    setPage,
    setPageSize,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
    totalPages,
    totalItems: data.length,
    paginatedData,
  };
};

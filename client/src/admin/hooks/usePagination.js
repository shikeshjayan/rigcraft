import { useState, useMemo } from "react";

export const usePagination = (data = [], pageSize = 10) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetPage = () => setPage(0);

  return {
    page,
    rowsPerPage,
    totalPages,
    totalItems: data.length,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  };
};

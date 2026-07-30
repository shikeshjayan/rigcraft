import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

export const useSearch = (data = [], searchFields = []) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim() || searchFields.length === 0) return data;

    const query = debouncedQuery.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, debouncedQuery, searchFields]);

  return {
    search: searchQuery,
    setSearch: setSearchQuery,
    filteredData,
    totalResults: filteredData.length,
  };
};

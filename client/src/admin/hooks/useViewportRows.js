import { useState, useEffect, useRef, useCallback } from "react";

export const useViewportRows = ({ rowHeight = 49, minRows = 5, maxRowsLimit = 20 } = {}) => {
  const containerRef = useRef(null);
  const [maxRows, setMaxRows] = useState(minRows);

  const calculate = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const vh = window.innerHeight;
    const top = el.getBoundingClientRect().top;
    const available = vh - top - 224;
    const rows = Math.floor(available / rowHeight);
    setMaxRows(Math.max(minRows, Math.min(maxRowsLimit, rows)));
  }, [rowHeight, minRows, maxRowsLimit]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(calculate);
    ro.observe(el);
    calculate();
    return () => ro.disconnect();
  }, [calculate]);

  return { maxRows, containerRef };
};

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./toast/useToast";

const REASONS = ["spam", "inappropriate", "fake", "other"];

const ReportReview = ({ itemId, authorId }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (user?._id === authorId) return null;

  const handleOpen = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post(`/reviews/${itemId}/report`, { reason, note });
      toast("Review reported. Thank you.");
      setOpen(false);
      setNote("");
      setReason("spam");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to report review.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-[13px] font-medium text-[#6B7280] hover:text-[var(--color-danger)] cursor-pointer bg-transparent border-none p-0"
        aria-label="Report this review">
        <FlagIcon sx={{ fontSize: 16 }} />
        Report
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg p-8 shadow-2xl z-10"
              style={{
                backgroundColor: "var(--color-bg-secondary, #ffffff)",
                borderRadius: "var(--radius-sm, 8px)",
              }}>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-500 transition-colors hover:text-[var(--color-danger)]"
                aria-label="Close">
                <CloseIcon />
              </button>

              <h3
                className="text-[22px] font-extrabold mb-2"
                style={{ color: "var(--color-text, #0f172a)" }}>
                Report Review
              </h3>
              <p className="text-[14px] mb-6" style={{ color: "#6B7280" }}>
                Help us keep RigCraft reviews trustworthy. Why are you reporting this review?
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label
                    className="block text-[14px] font-semibold mb-3"
                    style={{ color: "var(--color-text, #0f172a)" }}>
                    Reason
                  </label>
                  <div className="flex flex-col gap-2">
                    {REASONS.map((r) => (
                      <label
                        key={r}
                        className="flex items-center gap-2 text-[14px] cursor-pointer capitalize"
                        style={{ color: "#374151" }}>
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-[var(--color-primary)]"
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[14px] font-semibold mb-2"
                    style={{ color: "var(--color-text, #0f172a)" }}>
                    Note (optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-[14px] placeholder:text-gray-400 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    style={{ color: "var(--color-text)", backgroundColor: "var(--color-bg-primary)" }}
                    placeholder="Add any details about the issue..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="font-semibold transition-all duration-300 ease-in-out hover:scale-[1.03] cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    height: "46px",
                    borderRadius: "var(--radius-sm)",
                  }}>
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReportReview;

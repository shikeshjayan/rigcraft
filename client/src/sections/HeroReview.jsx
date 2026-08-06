import React, { useState, useEffect, useRef } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/toast/useToast";
import { useNavigate } from "react-router-dom";
import SkeletonCard from "../components/SkeletonCard";
import ReportReview from "../components/ReportReview";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "")
  ).toUpperCase() || "U";
};

const ReviewCard = ({ review, onReadMore, onToggleHelpful }) => {
  const charLimit = 140;
  const text = review.text || "";
  const isLong = text.length > charLimit;
  const displayText = isLong ? text.slice(0, charLimit) + "..." : text;

  return (
    <div
      className="flex flex-col p-8 shadow-xl border border-[#F3F4F6] transition-transform hover:-translate-y-1 h-full"
      style={{
        backgroundColor: "var(--color-bg-secondary, #ffffff)",
        borderRadius: "var(--radius-sm, 8px)",
      }}>
      <div className="flex items-center gap-4 mb-5">
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 shadow-sm"
          />
        ) : (
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-[16px] flex-shrink-0 shadow-sm"
            style={{ backgroundColor: review.avatarBg }}>
            {review.initials}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[15px] font-[800] text-[var(--color-text)]">
            {review.name}
          </span>
          <span className="text-[12px] font-medium text-[#6B7280]">
            {review.verified ? "Verified Purchase" : "Verified Customer"}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            sx={{ fontSize: 20, color: i < review.rating ? "#F59E0B" : "#E5E7EB" }}
          />
        ))}
      </div>

      <div className="flex-grow mb-6 cursor-pointer" onClick={() => onReadMore(review)}>
        <p className="text-[15px] text-[#4B5563] leading-relaxed font-medium">
          &quot;{displayText}&quot;
          {isLong && (
            <button
              onClick={() => onReadMore(review)}
              className="text-[var(--color-primary)] font-bold cursor-pointer ml-1 hover:underline whitespace-nowrap bg-transparent border-none p-0"
              aria-label={`Read more of ${review.name}'s review`}>
              read more...
            </button>
          )}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={() => onToggleHelpful(review)}
          className={`flex items-center gap-2 text-[13px] font-semibold cursor-pointer bg-transparent border-none p-0 ${
            review.voted ? "text-[var(--color-primary)]" : "text-[#6B7280] hover:text-[var(--color-primary)]"
          }`}
          aria-label="Mark review as helpful">
          <ThumbUpIcon sx={{ fontSize: 18 }} />
          Helpful ({review.helpfulCount || 0})
        </button>
      </div>
    </div>
  );
};

const HeroReview = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const userId = user?._id;

  const carouselRef = useRef(null);
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await apiClient.get("/reviews/testimonials");
      const data = res.data?.data || [];
      setTestimonials(
        Array.isArray(data)
          ? data.map((t) => ({
              id: t._id,
              name:
                `${t.user?.firstName || ""} ${t.user?.lastName || ""}`.trim() ||
                "Customer",
              userId: t.user?._id,
              initials: getInitials(
                `${t.user?.firstName || ""} ${t.user?.lastName || ""}`
              ),
              avatar: t.user?.avatar,
              avatarBg: "var(--color-primary)",
              text: t.comment || "",
              rating: t.rating || 5,
              verified: !!t.isVerifiedPurchase,
              helpfulCount: t.helpfulCount || 0,
              voted:
                !!userId &&
                (t.helpfulVotes || []).some(
                  (v) => String(v) === String(userId)
                ),
            }))
          : []
      );
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHelpful = async (review) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      await apiClient.patch(`/reviews/${review.id}/helpful`);
      setTestimonials((prev) =>
        prev.map((r) => {
          if (r.id !== review.id) return r;
          const voted = !r.voted;
          return { ...r, voted, helpfulCount: Math.max(0, r.helpfulCount + (voted ? 1 : -1)) };
        })
      );
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update vote.", "error");
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (selectedReview || submitOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedReview, submitOpen]);

  const handleShare = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setSubmitOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/reviews/testimonial", {
        rating: Number(rating),
        comment,
        title: "Testimonial",
      });
      toast("Testimonial submitted. It will appear after admin approval.");
      setSubmitOpen(false);
      setComment("");
      setRating(5);
      fetchTestimonials();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to submit testimonial.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="w-full py-20 relative"
      style={{ backgroundColor: "var(--color-bg-primary, #F9FAFB)" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <div className="w-full text-center md:text-left">
            <p className="text-[13px] font-[800] uppercase tracking-[0.2em] mb-3 text-[var(--color-primary)]">
              REVIEWS
            </p>
            <h2
              className="text-[32px] md:text-[44px] font-extrabold tracking-tight"
              style={{ color: "var(--color-text)" }}>
              What Our Customers Say
            </h2>
          </div>

          <div className="flex items-center gap-4 mt-6 md:mt-0 self-end md:self-auto">
            <button
              onClick={handleShare}
              className="font-semibold whitespace-nowrap transition-all duration-300 ease-in-out hover:scale-[1.03] cursor-pointer md:w-max"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                height: "44px",
                padding: "0 24px",
                borderRadius: "var(--radius-sm)",
              }}>
              Share Your Experience
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                style={{ borderRadius: "var(--radius-sm, 8px)" }}
                aria-label="Previous">
                <ChevronLeftIcon />
              </button>
              <button
                onClick={scrollRight}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm cursor-pointer"
                style={{ borderRadius: "var(--radius-sm, 8px)" }}
                aria-label="Next">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-300"
            style={{
              backgroundColor: "var(--color-bg-secondary, #ffffff)",
              borderRadius: "var(--radius-sm, 8px)",
            }}>
            <StarIcon sx={{ fontSize: 40, color: "#F59E0B" }} />
            <p
              className="mt-4 text-[16px] font-bold"
              style={{ color: "var(--color-text)" }}>
              No testimonials yet
            </p>
            <p className="mt-1 text-[14px]" style={{ color: "#6B7280" }}>
              Be the first to share your experience with us!
            </p>
            <button
              onClick={handleShare}
              className="mt-6 font-semibold transition-all duration-300 ease-in-out hover:scale-[1.03] cursor-pointer"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                height: "44px",
                padding: "0 24px",
                borderRadius: "var(--radius-sm)",
              }}>
              Share Your Experience
            </button>
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {testimonials.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex flex-col snap-start">
                <ReviewCard
                  review={review}
                  onReadMore={setSelectedReview}
                  onToggleHelpful={handleToggleHelpful}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReview(null)}>
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

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
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-500 transition-colors hover:text-[var(--color-danger)]"
                aria-label="Close">
                <CloseIcon />
              </button>

              <div className="flex items-center gap-4 mb-8">
                {selectedReview.avatar ? (
                  <img
                    src={selectedReview.avatar}
                    alt={selectedReview.name}
                    className="w-14 h-14 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className="w-14 h-14 flex items-center justify-center rounded-full text-white font-bold text-[18px] shadow-sm"
                    style={{ backgroundColor: selectedReview.avatarBg }}>
                    {selectedReview.initials}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[18px] font-[800] text-[var(--color-text)]">
                    {selectedReview.name}
                  </span>
                  <span className="text-[14px] font-medium text-[#6B7280]">
                    {selectedReview.verified ? "Verified Purchase" : "Verified Customer"}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    sx={{ fontSize: 24, color: i < selectedReview.rating ? "#F59E0B" : "#E5E7EB" }}
                  />
                ))}
              </div>

              <p className="text-[16px] text-[#374151] leading-relaxed font-medium mb-8">
                &quot;{selectedReview.text}&quot;
              </p>

              <div className="flex justify-end">
                <ReportReview itemId={selectedReview.id} authorId={selectedReview.userId} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {submitOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSubmitOpen(false)}>
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
            />

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
                onClick={() => setSubmitOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-500 transition-colors hover:text-[var(--color-danger)]"
                aria-label="Close">
                <CloseIcon />
              </button>

              <h3
                className="text-[22px] font-extrabold mb-2"
                style={{ color: "var(--color-text)" }}>
                Share Your Experience
              </h3>
              <p className="text-[14px] mb-6" style={{ color: "#6B7280" }}>
                Your testimonial will appear here after admin approval.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label
                    className="block text-[14px] font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}>
                    Rating
                  </label>
                  <div className="flex gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} onClick={() => setRating(star)}>
                        {star <= rating ? (
                          <StarIcon sx={{ fontSize: 28, color: "#F59E0B" }} />
                        ) : (
                          <StarBorderIcon sx={{ fontSize: 28, color: "#F59E0B" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-[14px] font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}>
                    Comment
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-[14px] placeholder:text-gray-400 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    style={{ color: "var(--color-text)", backgroundColor: "#ffffff" }}
                    placeholder="How was your experience with RigCraft?"
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
                  {submitting ? "Submitting..." : "Submit Testimonial"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroReview;

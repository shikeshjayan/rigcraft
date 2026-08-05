import { useState, useEffect, useCallback } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from './toast/useToast';
import ReportReview from './ReportReview';
import SelectDropdown from './SelectDropdown';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'verified', label: 'Verified' },
  { key: '5', label: '5\u2605' },
  { key: '4', label: '4\u2605' },
  { key: 'latest', label: 'Latest' },
  { key: 'oldest', label: 'Oldest' },
];

const PAGE_SIZE = 5;

const ProductReviews = ({ itemId, itemType, ratingSummary }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDocs, setTotalDocs] = useState(0);
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchReviews = useCallback(async (pageNum = 1, append = false) => {
    try {
      const active = FILTERS.find((f) => f.key === activeFilter) || FILTERS[0];
      const params = new URLSearchParams({
        sort: active.key === 'latest' ? 'newest' : active.key === 'oldest' ? 'oldest' : 'verified',
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });
      if (active.key === 'verified') params.set('verifiedOnly', 'true');
      if (active.key === '5') params.set('minRating', '5');
      if (active.key === '4') params.set('minRating', '4');
      const endpoint = itemType === 'prebuilt' 
        ? `/reviews/prebuilt/${itemId}?${params.toString()}` 
        : `/reviews/product/${itemId}?${params.toString()}`;
        
      const res = await apiClient.get(endpoint);
      const data = res.data?.data || res.data || {};
      const docs = data.docs || [];
      setReviews((prev) => (append ? [...prev, ...docs] : docs));
      setTotalDocs(data.totalDocs || docs.length || 0);
      setPage(pageNum);
      setHasMore(
        data.hasNextPage === true
          ? true
          : data.totalPages
            ? pageNum < data.totalPages
            : docs.length === PAGE_SIZE
      );
      if (!append) {
        const dist = data.distribution;
        const distSum = dist ? [1, 2, 3, 4, 5].reduce((s, n) => s + (dist[n] || 0), 0) : 0;
        if (dist && distSum > 0) {
          setDistribution(dist);
        } else if (docs.length > 0) {
          const local = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          docs.forEach((r) => {
            const star = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
            local[star] += 1;
          });
          setDistribution(local);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType, activeFilter]);

  useEffect(() => {
    if (itemId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReviews();
    }
  }, [itemId, itemType, activeFilter, fetchReviews]);

  const handleToggleHelpful = async (rev) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await apiClient.patch(`/reviews/${rev._id}/helpful`);
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== rev._id) return r;
          const voted = !r.voted;
          return { ...r, voted, helpfulCount: Math.max(0, r.helpfulCount + (voted ? 1 : -1)) };
        })
      );
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update vote.", 'error');
    }
  };

  const handleShowMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchReviews(page + 1, true).finally(() => setLoadingMore(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      const msg = "Comment is required.";
      setErrorMsg(msg);
      toast(msg, 'error');
      return;
    }
    if (trimmedComment.length > 1000) {
      const msg = "Comment too long (max 1000 characters).";
      setErrorMsg(msg);
      toast(msg, 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        itemType,
        item: itemId,
        rating: Number(rating),
        comment: trimmedComment,
        title: "Review"
      };

      await apiClient.post('/reviews/product', payload);
      
      toast('Review submitted successfully.');
      setSuccessMsg("Review submitted successfully!");
      setComment("");
      setRating(5);
      fetchReviews(); // Refresh the reviews list
    } catch (err) {
      toast(err.response?.data?.message || "Failed to submit review.", 'error');
      setErrorMsg(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageAverage = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) * 10) / 10
    : 0;

  const displayAvg = ratingSummary?.average || pageAverage;
  const displayCount = ratingSummary?.count ?? (totalDocs || reviews.length);
  const distTotal = displayCount || [1, 2, 3, 4, 5].reduce((s, n) => s + (distribution[n] || 0), 0);

  return (
    <div className="mt-12 border-t border-[#E7E7E7] pt-10">
      <h2 className="text-[20px] font-bold text-[#0F1111] mb-6">Customer Reviews</h2>

      {/* Review Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4 bg-white border border-[#E7E7E7] rounded-md p-5">
        <div className="flex flex-col items-center">
          <span className="text-[40px] font-extrabold text-[#0F1111] leading-none">{displayAvg || 'New'}</span>
          <div className="flex text-[#F59E0B] mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} sx={{ fontSize: 16, color: star <= displayAvg ? 'inherit' : '#E5E7EB' }} />
            ))}
          </div>
          <span className="text-[12px] text-[#565959] mt-1">{displayCount} review{displayCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="sm:flex-1 h-12 border-l border-[#E7E7E7] sm:ml-2 hidden sm:block" />
        <div className="flex-1">
          <div className="text-[14px] font-bold text-[#0F1111] mb-2">What customers are saying</div>
          {distTotal > 0 ? (
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = distribution[n] || 0;
                const pct = distTotal > 0 ? Math.round((count / distTotal) * 100) : 0;
                return (
                  <button
                    key={n}
                    onClick={() => setActiveFilter(String(n))}
                    className="w-full flex items-center gap-2 group cursor-pointer"
                    aria-label={`Filter ${n} star reviews`}
                  >
                    <span className="text-[12px] text-[#565959] w-6 text-right shrink-0 group-hover:text-[#0047AB]">{n}</span>
                    <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F59E0B]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] text-[#94A3B8] w-8 shrink-0">{pct}%</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-[#565959]">
              No reviews yet. Be the first to share your experience!
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <div className="bg-white border border-[#E7E7E7] rounded-md p-5">
          <h3 className="text-[16px] font-bold text-[#0F1111] mb-4">Write a Review</h3>
          {!isLoggedIn ? (
            <p className="text-[#565959] text-sm">Please log in to write a review.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-2 rounded-sm">{errorMsg}</div>}
              {successMsg && <div className="text-green-600 text-sm bg-green-50 border border-green-100 p-2 rounded-sm">{successMsg}</div>}
              
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Rating</label>
                <div className="flex cursor-pointer text-[#F59E0B]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} onClick={() => setRating(star)}>
                      {star <= rating ? <StarIcon /> : <StarBorderIcon />}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1">Comment</label>
                <textarea 
                  required
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-[#D5D9D9] rounded-sm p-2 focus:ring-1 focus:ring-[#0047AB] focus:border-[#0047AB] outline-none"
                  placeholder="What did you like or dislike?"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[12px] text-[#94A3B8]">{comment.length}/1000</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-[#0047AB] text-white py-2.5 px-4 rounded-sm font-bold hover:bg-[#003C8C] transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#0F1111]">Latest Reviews</h3>
              <div className="hidden md:flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors cursor-pointer ${
                      activeFilter === f.key
                        ? 'bg-[#0047AB] text-white border-[#0047AB]'
                        : 'bg-white text-[#565959] border-[#D5D9D9] hover:border-[#0047AB] hover:text-[#0047AB]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:hidden mt-3">
              <SelectDropdown
                value={activeFilter}
                onChange={(v) => setActiveFilter(v)}
                placeholder="Filter"
                options={FILTERS.map((f) => ({ value: f.key, label: f.label }))}
              />
            </div>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border-b border-[#F3F4F6] pb-6 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                      <div className="h-2.5 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-2/3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-[#E7E7E7] rounded-md p-8 text-center">
              <p className="text-[#565959] mb-2">No reviews yet. Be the first to review this product!</p>
              <p className="text-[13px] text-[#94A3B8]">Your feedback helps other customers make the right choice.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                {reviews.map((rev) => {
                  const voted = !!user?._id && (rev.helpfulVotes || []).some((v) => String(v) === String(user._id));
                  return (
                  <div key={rev._id} className="border-b border-[#F3F4F6] pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#0047AB]/10 text-[#0047AB] flex items-center justify-center font-bold text-sm">
                      {rev.user?.firstName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#0F1111]">{rev.user?.firstName} {rev.user?.lastName}</div>
                      <div className="text-xs text-[#94A3B8]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                        {rev.isVerifiedPurchase && <span className="ml-2 text-green-600 font-medium">Verified Purchase</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex text-[#F59E0B] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 14, color: i < rev.rating ? 'inherit' : '#E5E7EB' }} />
                    ))}
                  </div>
                  
                  <p className="text-sm text-[#333] whitespace-pre-line">{rev.comment}</p>

                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => handleToggleHelpful(rev)}
                      className={`flex items-center gap-1 text-[13px] font-semibold bg-transparent border-none p-0 cursor-pointer ${
                        voted ? "text-[var(--color-primary)]" : "text-[#6B7280] hover:text-[var(--color-primary)]"
                      }`}
                      aria-label="Mark review as helpful"
                    >
                      <ThumbUpIcon sx={{ fontSize: 16 }} />
                      Helpful ({rev.helpfulCount || 0})
                    </button>
                    <ReportReview itemId={rev._id} authorId={rev.user?._id} />
                  </div>
                </div>
                );
              })}
              </div>
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={handleShowMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-sm font-bold border border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? "Loading..." : `Load More Reviews (${reviews.length} of ${totalDocs})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;

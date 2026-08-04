import React, { useState, useEffect } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from './toast/useToast';

const ProductReviews = ({ itemId, itemType }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      const endpoint = itemType === 'prebuilt' 
        ? `/reviews/prebuilt/${itemId}` 
        : `/reviews/product/${itemId}`;
        
      const res = await apiClient.get(endpoint);
      setReviews(res.data?.data?.docs || res.data?.docs || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId, itemType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        itemType,
        item: itemId,
        rating: Number(rating),
        comment,
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

  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold mb-4">Write a Review</h3>
          {!isLoggedIn ? (
            <p className="text-gray-500 text-sm">Please log in to write a review.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorMsg}</div>}
              {successMsg && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{successMsg}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex cursor-pointer text-[#0047AB]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} onClick={() => setRating(star)}>
                      {star <= rating ? <StarIcon /> : <StarBorderIcon />}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea 
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-[#0047AB] focus:border-[#0047AB]"
                  placeholder="What did you like or dislike?"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-[#0047AB] text-white py-2 px-4 rounded-full font-bold hover:bg-[#003C8C] transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-bold mb-4">Latest Reviews</h3>
          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {rev.user?.firstName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{rev.user?.firstName} {rev.user?.lastName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                        {rev.isVerifiedPurchase && <span className="ml-2 text-green-600 font-medium">Verified Purchase</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex text-[#0047AB] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 14, color: i < rev.rating ? 'inherit' : '#E5E7EB' }} />
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-700 whitespace-pre-line">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;

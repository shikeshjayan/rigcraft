import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <FadeUp delay={0.1}>
    <div className="w-full min-h-screen bg-white py-12 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Wishlist' }]} />
        <div className="mb-10 flex items-baseline gap-2">
          <h1 className="text-[20px] font-[800] text-[#282C3F]">My Wishlist</h1>
          <span className="text-[20px] font-normal text-[#282C3F]">{wishlist.length} items</span>
        </div>

        {/* Wishlist Grid */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-[24px] font-bold text-[#282C3F] mb-4">Your wishlist is empty</h2>
            <p className="text-[#696E79] mb-8">Save items that you like in your wishlist. Review them anytime and easily move them to the bag.</p>
            <a href="/" className="px-8 py-3 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors">
              CONTINUE SHOPPING
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wishlist.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col bg-white border border-[#EAEAEC] relative group hover:shadow-md transition-shadow"
              >
                {/* Delete Button (X) */}
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-[#282C3F] border border-[#D4D5D9] z-10 transition-colors shadow-sm"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Product Image */}
                <div className="w-full aspect-[3/4] bg-[#F5F6F6] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <div className="p-3 pb-0 flex flex-col flex-grow">
                  <Link 
                    to={`/detail/${item.id}`}
                    className="text-[14px] text-[#282C3F] hover:text-[var(--color-primary)] font-normal truncate mb-2 transition-colors cursor-pointer block"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-[14px] font-[800] text-[#282C3F]">Rs.{item.price.replace('₹', '')}</span>
                    <span className="text-[12px] text-[#7E818C] line-through">{item.mrp || 'Rs.0'}</span>
                    <span className="text-[12px] text-[#FF905A] font-bold">({item.discount || '0% OFF'})</span>
                  </div>
                </div>

                {/* Move to Bag Button */}
                <div className="w-full border-t border-[#EAEAEC] mt-auto">
                  <button 
                    onClick={() => {
                      addToCart(item);
                      alert('Added to cart!');
                    }}
                    className="w-full py-3.5 text-[14px] font-[700] text-white bg-[var(--color-primary)] tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </FadeUp>
  );
};

export default Wishlist;

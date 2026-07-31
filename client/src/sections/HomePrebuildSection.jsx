import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const HomePrebuildSection = () => {
  const [prebuilts, setPrebuilts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrebuilts = async () => {
      try {
        const { data } = await apiClient.get('/prebuilt-pcs');
        if (data && data.data) {
          const docs = data.data.docs || data.data;
          setPrebuilts(Array.isArray(docs) ? docs.slice(0, 8) : []);
        }
      } catch (error) {
        console.error('Failed to fetch prebuilt PCs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrebuilts();
  }, []);

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Section (Same design as HomeCategory) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#111111] uppercase tracking-wide">
              Prebuilt <span style={{ color: 'var(--color-primary)' }}>PCs</span>
            </h2>
            <p className="text-[#6B7280] mt-2 text-[16px] font-[500]">
              Discover our range of high-performance prebuilt gaming and workstation PCs.
            </p>
          </div>
          <Link to="/prebuild" className="font-[600] text-[16px] flex items-center gap-1 mt-4 md:mt-0 transition-transform hover:translate-x-1 cursor-pointer" style={{ color: 'var(--color-primary)' }}>
            View All Prebuilt PCs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {/* Grid Section (4 columns, 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {prebuilts.map((pc) => {
            const id = pc._id || pc.id;
            const image = pc.images?.[0]?.url || pc.images?.[0] || pc.image || null;
            const title = pc.name || pc.title;
            const priceVal = pc.pricing?.price || pc.priceVal;
            const mrpVal = pc.pricing?.salePrice || pc.mrpVal;
            const price = priceVal ? `₹${priceVal.toLocaleString()}` : pc.price;
            const mrp = mrpVal ? `₹${mrpVal.toLocaleString()}` : pc.mrp;
            const specs = pc.specs || pc.tags || [];
            
            return (
              <div key={id} className="transform hover:-translate-y-2 transition-transform duration-300">
                <Card 
                  rating={pc?.rating}
                  key={id}
                  id={id}
                  image={image}
                  title={title}
                  specs={specs}
                  description={pc.description}
                  price={price}
                  mrp={mrp}
                  discount={pc.discount}
                  tag={pc.tag}
                  tagColor={pc.tagColor}
                  category="prebuilt"
                />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HomePrebuildSection;

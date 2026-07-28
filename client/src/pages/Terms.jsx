import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-bg-secondary)] p-8 md:p-12 rounded-xl border border-[var(--color-border)] shadow-sm"
        >
          <h1 className="text-3xl md:text-5xl font-black text-[var(--color-text)] mb-8">Terms of <span className="text-[var(--color-primary)]">Service</span></h1>
          
          <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] space-y-6">
            <p><strong>Last Updated:</strong> October 2025</p>
            
            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">1. Agreement to Terms</h2>
            <p>By accessing or using the RigCraft website and our PC building services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">2. Products and Services</h2>
            <p>RigCraft provides custom PC building services, prebuilt PCs, and individual computer components. All products are subject to availability, and we reserve the right to impose quantity limits on any order, to reject all or part of an order, and to discontinue products or services without notice.</p>
            <p>The PC Builder compatibility engine is provided as a guide. While we strive for 100% accuracy, we will contact you if any incompatibilities are discovered during the physical assembly of your custom build.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">3. Pricing and Payments</h2>
            <p>All prices are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed. We accept various payment methods, which are processed securely through our payment providers.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">4. Build Time and Shipping</h2>
            <p>Estimated build and delivery times are provided as guidelines only. We are not responsible for delays caused by shipping carriers, component shortages, or other circumstances beyond our reasonable control.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">5. Warranty and Returns</h2>
            <p>Our custom PCs include a standard warranty covering parts and labor. The specific terms of the warranty and our return policy are outlined on our Warranty & Returns page, which forms part of these Terms of Service.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">6. Changes to Terms</h2>
            <p>We may revise these Terms of Service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these terms.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;

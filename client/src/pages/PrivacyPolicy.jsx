import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-bg-secondary)] p-8 md:p-12 rounded-xl border border-[var(--color-border)] shadow-sm"
        >
          <h1 className="text-3xl md:text-5xl font-black text-[var(--color-text)] mb-8">Privacy <span className="text-[var(--color-primary)]">Policy</span></h1>
          
          <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] space-y-6">
            <p><strong>Last Updated:</strong> October 2025</p>
            
            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">1. Introduction</h2>
            <p>Welcome to RigCraft. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data:</strong> includes bank account and payment card details (processed securely by our payment gateways).</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
              <li><strong>Profile Data:</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
            </ul>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling your PC order).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

            <h2 className="text-xl font-bold text-[var(--color-text)] mt-8">5. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@rigcraft.com.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

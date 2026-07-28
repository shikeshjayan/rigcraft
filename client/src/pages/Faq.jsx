import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '../components/Breadcrumb';

const Faq = () => {
  const faqs = [
    {
      question: "How long does it take to build and ship my custom PC?",
      answer: "Typically, standard builds take 3-5 business days for assembly, stress testing, and quality assurance. Shipping usually takes an additional 2-4 days depending on your location."
    },
    {
      question: "Do you offer warranties on your custom PCs?",
      answer: "Yes, all our custom PCs come with a standard 3-year warranty on parts and labor. We also offer extended warranty options during checkout."
    },
    {
      question: "Can I upgrade my RigCraft PC later?",
      answer: "Absolutely! We build our PCs using standard, non-proprietary parts. You can easily upgrade components like RAM, GPU, or storage in the future."
    },
    {
      question: "What happens if a part is incompatible in the PC Builder?",
      answer: "Our PC Builder has a built-in compatibility engine. If you select incompatible parts, it will automatically alert you and prevent the build from being completed to ensure everything works perfectly."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, RigCraft only ships within India. We are looking to expand internationally in the future."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg-primary)] pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'FAQ' }]} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text)] mb-6">Frequently Asked <span className="text-[var(--color-primary)]">Questions</span></h1>
          <p className="text-[var(--color-text-secondary)] text-lg">Everything you need to know about RigCraft, our PCs, and our services.</p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--color-bg-secondary)] p-6 md:p-8 rounded-lg border border-[var(--color-border)] shadow-sm"
            >
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{faq.question}</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;

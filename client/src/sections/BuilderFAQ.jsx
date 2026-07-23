import React, { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const FAQS = [
  {
    id: 1,
    question: 'How does compatibility checking work?',
    answer: 'Our automated system cross-references all selected components against a massive database of specifications. It ensures your motherboard supports your CPU socket, your case fits your GPU length, and your power supply provides enough wattage for the entire system.'
  },
  {
    id: 2,
    question: 'What is the warranty on custom builds?',
    answer: 'All Rigcraft custom builds come with a comprehensive 2-year warranty on parts and labor. We also handle individual manufacturer warranties on your behalf, so you only ever have to deal with our support team.'
  },
  {
    id: 3,
    question: 'How long does assembly and shipping take?',
    answer: 'Standard assembly and stress-testing take 3-5 business days. Once your system passes our rigorous quality control, it is shipped via insured express courier, which typically takes an additional 2-3 days depending on your location.'
  }
];

const BuilderFAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full py-16" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-[800px] mx-auto px-4 lg:px-8">
        
        <h2 className="text-[20px] font-bold text-[#0F172A] mb-6 text-center md:text-left">
          Frequently Asked Questions
        </h2>

        <div className="flex flex-col gap-3">
          {FAQS.map(faq => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id}
                className="bg-white border border-[#CBD5E1] overflow-hidden"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <button 
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  <span className="font-bold text-[#0F172A] text-[15px]">{faq.question}</span>
                  <KeyboardArrowDownIcon 
                    sx={{ fontSize: 24, color: '#64748B' }} 
                    className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {isOpen && (
                  <div className="p-4 pt-0 text-[#64748B] text-[14px] leading-relaxed border-t border-[#E2E8F0] mt-2">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default BuilderFAQ;

import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '../components/Breadcrumb';
import FadeUp from '../components/FadeUp';
import { faqService } from '../services/faq.service';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShieldIcon from '@mui/icons-material/Shield';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const CATEGORY_ORDER = ['Orders', 'Payments', 'Shipping', 'Warranty', 'Returns', 'Products', 'PC Builder', 'General'];

const HELP_CARDS = [
  {
    to: '/contact',
    icon: HeadsetMicIcon,
    title: 'Contact Support',
    desc: 'Reach our expert support team directly. Submit a request and we\'ll get back to you quickly.'
  },
  {
    to: '/orders',
    icon: LocalShippingIcon,
    title: 'Track Order',
    desc: 'Follow your order from the moment it ships until it reaches your doorstep.'
  },
  {
    to: '/warranty',
    icon: ShieldIcon,
    title: 'Warranty Claims',
    desc: 'Every RigCraft PC comes with a 3-year warranty. File a claim in minutes.'
  },
  {
    to: '/returns',
    icon: AssignmentReturnIcon,
    title: 'Returns & Refunds',
    desc: 'Not happy with your purchase? Learn about our returns policy and start a return.'
  },
  {
    to: '/pc-builder-guide',
    icon: BuildIcon,
    title: 'PC Builder Guide',
    desc: 'New to building? Follow our step-by-step guide to create your perfect rig.'
  }
];

const normalizeFaqs = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data?.data) return data.data.data;
  if (data?.data) return data.data;
  if (data?.docs) return data.docs;
  return [];
};

const HelpCenter = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: faqsData, isLoading } = useQuery({
    queryKey: ['helpFaqs'],
    queryFn: () => faqService.getFaqs(),
  });

  const [openFaq, setOpenFaq] = useState(null);

  const groupedFaqs = useMemo(() => {
    const faqs = normalizeFaqs(faqsData);
    const map = {};
    faqs.forEach((faq) => {
      const category = faq.category || 'General';
      if (!map[category]) map[category] = [];
      map[category].push(faq);
    });
    return map;
  }, [faqsData]);

  const categories = CATEGORY_ORDER.filter((cat) => groupedFaqs[cat]?.length);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Help Center' }]} />

        <FadeUp>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-6">
              <SupportAgentIcon sx={{ fontSize: 36, color: 'var(--color-primary)' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text)] mb-4 tracking-tight uppercase">
              Help <span className="text-[var(--color-primary)]">Center</span>
            </h1>
            <p className="text-[16px] text-[var(--color-text-secondary)] font-medium max-w-2xl mx-auto">
              Everything you need to get the most out of RigCraft. Find answers in our FAQs, track your order, or talk to our support team.
            </p>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {HELP_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={card.to}
                    className="group flex flex-col h-full bg-[var(--color-card)] p-8 border border-[var(--color-border)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-[var(--color-primary)]/10 mb-6">
                      <Icon sx={{ fontSize: 30, color: 'var(--color-primary)' }} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">{card.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[var(--color-text)] mb-3 tracking-tight uppercase">
                Frequently Asked <span className="text-[var(--color-primary)]">Questions</span>
              </h2>
              <p className="text-[15px] text-[var(--color-text-secondary)] font-medium">
                Browse by category to find quick answers.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-[var(--color-card)] border border-[var(--color-border)] animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 bg-[var(--color-card)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-sm)' }}>
                <p className="text-[var(--color-text-secondary)] font-medium">No FAQs available right now. Check back soon or contact our support team.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-3">
                      <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                      {category}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {groupedFaqs[category].map((faq) => {
                        const isOpen = openFaq === faq._id;
                        return (
                          <div
                            key={faq._id}
                            className="bg-[var(--color-card)] border border-[var(--color-border)] shadow-sm overflow-hidden"
                            style={{ borderRadius: 'var(--radius-sm)' }}
                          >
                            <button
                              type="button"
                              onClick={() => setOpenFaq(isOpen ? null : faq._id)}
                              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-[15px] text-[var(--color-text)]">{faq.question}</span>
                              <ExpandMoreIcon
                                sx={{
                                  fontSize: 24,
                                  color: 'var(--color-primary)',
                                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.25s ease',
                                  flexShrink: 0
                                }}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <p className="px-6 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium border-t border-[var(--color-border)] pt-4">
                                    {faq.answer}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeUp>
      </div>

      {/* Still Need Help CTA - full width */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <div className="bg-[var(--color-text)] px-6 md:px-14 py-10 md:py-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[var(--color-primary)]/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-[var(--color-bg-primary)] mb-3 tracking-tight uppercase">
              Still Need <span className="text-[var(--color-primary)]">Help?</span>
            </h2>
            <p className="text-[var(--color-muted)] font-medium max-w-xl mx-auto mb-8">
              Our support team is here for you. Reach out and we'll help you resolve any issue, big or small.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-[var(--color-primary)] text-[var(--color-bg-primary)] font-bold py-3 px-10 transition-opacity hover:opacity-90"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

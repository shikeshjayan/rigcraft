import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import apiClient from '../api/client';

const DealsNewsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const subscribeMutation = useMutation({
    mutationFn: (emailData) => apiClient.post('/newsletter/subscribe', emailData),
    onSuccess: () => {
      setStatus('success');
      setMessage('You are subscribed! Watch your inbox for the next flash sale.');
      setEmail('');
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        setStatus('success');
        setMessage('You are already subscribed. Stay tuned for more deals!');
        return;
      }
      setStatus('error');
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again later.');
    },
  });

  const handleSubscribe = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setStatus('error');
      setMessage('Please enter an email address.');
      return;
    }

    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    subscribeMutation.mutate({ email });
  };

  return (
    <section className="w-full py-16 border-t border-[var(--color-border)] bg-gradient-to-r from-[#0052FF] to-[#0047AB] overflow-hidden">
      <div className="relative max-w-[1500px] mx-auto px-4 lg:px-8">
        <div className="absolute top-[-30%] right-[-5%] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 text-white/90 text-[11px] font-extrabold uppercase tracking-wider bg-white/15 px-3 py-1.5 rounded-full mb-4">
              <NotificationsActiveIcon sx={{ fontSize: 15 }} />
              Never Miss a Deal
            </span>
            <h3 className="text-[24px] md:text-[32px] font-extrabold text-white leading-tight">
              Get exclusive offers & flash sale alerts
            </h3>
            <p className="text-[14px] md:text-[15px] text-white/80 font-medium mt-2 max-w-xl">
              Subscribe to receive exclusive discounts and early access to flash sales before they go public.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setMessage('');
                  }
                }}
                placeholder="Enter your email"
                className="px-4 py-3 w-full text-[#111111] focus:outline-none bg-white"
                style={{ borderRadius: 'var(--radius-sm)' }}
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="px-8 py-3 bg-white text-[#0052FF] font-bold uppercase tracking-wide hover:brightness-95 transition-all whitespace-nowrap cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {message && (
              <p
                className={`mt-3 text-[13px] font-bold text-center sm:text-left ${status === 'error' ? 'text-[#FECACA]' : 'text-[#A7F3D0]'}`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsNewsletter;

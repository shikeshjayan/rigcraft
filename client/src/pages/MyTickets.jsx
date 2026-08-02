import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_customer: 'Waiting on You',
  resolved: 'Resolved',
  closed: 'Closed'
};

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  waiting_customer: 'bg-purple-50 text-purple-700 border-purple-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200'
};

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str);

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const MyTickets = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/support');
      return data.data?.tickets || [];
    },
    enabled: isLoggedIn
  });

  const content = isLoggedIn ? (
    <FadeUp>
      <div className="bg-white p-8 md:p-10 border border-gray-200 shadow-sm mt-8" style={{ borderRadius: 'var(--radius-sm)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <SupportAgentIcon sx={{ fontSize: 32, color: '#2563EB' }} />
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wide">My Support Tickets</h1>
              <p className="text-sm text-gray-500 font-medium">Track and follow up on your claims and requests.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase flex-shrink-0"
          >
            New Ticket
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-sm"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">Failed to load your tickets. Please try again later.</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10">
            <WarningAmberIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-500 text-sm mb-6">Submit a request and it will show up here for you to track.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/warranty')}
                className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase"
              >
                File Warranty Claim
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="border border-gray-300 text-gray-700 font-bold py-2.5 px-6 rounded-sm hover:bg-gray-50 transition-colors text-[13px] tracking-wide uppercase"
              >
                Contact Us
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => navigate(`/my-tickets/${ticket._id}`)}
                className="w-full text-left bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden group"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[13px] font-black text-blue-700 tracking-wider" style={{ fontFamily: 'var(--font-admin-mono, monospace)' }}>
                      {ticket.ticketNumber || `#${String(ticket._id).slice(-6).toUpperCase()}`}
                    </span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`} style={{ borderRadius: 'var(--radius-sm)' }}>
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </span>
                  </div>
                  <span className="text-[12px] text-gray-500 font-medium">
                    {ticket.lastMessageAt ? formatDate(ticket.lastMessageAt) : formatDate(ticket.createdAt)}
                  </span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1 truncate">{ticket.subject}</h3>
                    <div className="flex gap-4 text-[12px] text-gray-500 font-medium">
                      <span>{capitalize(ticket.issueType)}</span>
                      {ticket.order?.orderNumber && <span>Order #{ticket.order.orderNumber}</span>}
                    </div>
                  </div>
                  <ArrowForwardIcon fontSize="small" className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </FadeUp>
  ) : (
    <FadeUp>
      <div className="bg-white p-10 mt-8 text-center border border-gray-200 shadow-sm max-w-2xl mx-auto" style={{ borderRadius: 'var(--radius-sm)' }}>
        <WarningAmberIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Please Login</h3>
        <p className="text-gray-500 text-[14px] mb-6">Login to view and follow up on your support tickets.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase inline-flex items-center"
        >
          Login
        </button>
      </div>
    </FadeUp>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Tickets' }]} />
        {content}
      </div>
    </div>
  );
};

export default MyTickets;

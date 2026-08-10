import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { connectSocket, joinSupportRoom, leaveSupportRoom } from '../shared/socket';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
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

const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (att) =>
  (att.mimeType || '').startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(att.url || '');

const fileTypeLabel = (att) => {
  const mime = (att.mimeType || '').toLowerCase();
  if (mime.includes('pdf') || /\.pdf$/i.test(att.url || '')) return 'PDF';
  if (mime.includes('word') || /\.docx?$/i.test(att.url || '')) return 'DOC';
  if (mime.includes('excel') || mime.includes('spreadsheet') || /\.xlsx?$/i.test(att.url || '')) return 'XLS';
  if (mime.includes('presentation') || /\.pptx?$/i.test(att.url || '')) return 'PPT';
  if (mime.startsWith('text/') || /\.(txt|csv)$/i.test(att.url || '')) return 'TXT';
  if (mime.includes('zip') || mime.includes('rar') || /\.(zip|rar)$/i.test(att.url || '')) return 'ZIP';
  return 'FILE';
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyError, setReplyError] = useState('');
  const fileInputRef = useRef(null);

  const { data: ticketData, isLoading, isError } = useQuery({
    queryKey: ['myTicket', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/support/${id}`);
      return data.data;
    },
    enabled: isLoggedIn && !!id
  });

  const invalidateTicket = () => {
    queryClient.invalidateQueries({ queryKey: ['myTicket', id] });
    queryClient.invalidateQueries({ queryKey: ['myTickets'] });
  };

  useEffect(() => {
    if (!isLoggedIn || !id) return;
    const sock = connectSocket();
    const handleNewMessage = (message) => {
      queryClient.setQueryData(['myTicket', id], (old) => {
        if (!old) return old;
        if (old.messages?.some((m) => m._id === message._id)) return old;
        return { ...old, messages: [...old.messages, message] };
      });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    };
    const handleTicketUpdate = (ticket) => {
      queryClient.setQueryData(['myTicket', id], (old) =>
        old ? { ...old, ticket: { ...old.ticket, ...ticket } } : old
      );
    };
    joinSupportRoom(id);
    sock.on('support:new-message', handleNewMessage);
    sock.on('support:ticket-updated', handleTicketUpdate);
    return () => {
      sock.off('support:new-message', handleNewMessage);
      sock.off('support:ticket-updated', handleTicketUpdate);
      leaveSupportRoom(id);
    };
  }, [id, isLoggedIn, queryClient]);

  const sendReply = useMutation({
    mutationFn: async ({ message, files }) => {
      const formData = new FormData();
      formData.append('message', message);
      (files || []).forEach((file) => formData.append('attachments', file));
      const { data } = await apiClient.post(`/support/${id}/messages`, formData);
      return data;
    },
    onSuccess: () => {
      setReplyText('');
      setSelectedFiles([]);
      setReplyError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      invalidateTicket();
    },
    onError: (error) => {
      setReplyError(error.response?.data?.message || 'Failed to send reply. Please try again.');
    }
  });

  const closeTicket = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.put(`/support/${id}/close`);
      return data;
    },
    onSuccess: () => invalidateTicket(),
    onError: (error) => {
      setReplyError(error.response?.data?.message || 'Failed to close ticket.');
    }
  });

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyError('');
    sendReply.mutate({ message: replyText.trim(), files: selectedFiles });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Tickets', path: '/my-tickets' }, { label: 'Ticket' }]} />
          <FadeUp>
            <div className="bg-white p-10 mt-8 text-center border border-gray-200 shadow-sm max-w-2xl mx-auto" style={{ borderRadius: 'var(--radius-sm)' }}>
              <WarningAmberIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Please Login</h3>
              <p className="text-gray-500 text-[14px] mb-6">Login to view your support ticket.</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase inline-flex items-center"
              >
                Login
              </button>
            </div>
          </FadeUp>
        </div>
      </div>
    );
  }

  const ticket = ticketData?.ticket;
  const messages = ticketData?.messages || [];
  const isClosed = ticket?.status === 'closed';
  const assignedName = [ticket?.assignedTo?.firstName, ticket?.assignedTo?.lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'My Tickets', path: '/my-tickets' }, { label: ticket ? ticket.ticketNumber || 'Ticket' : 'Ticket' }]} />

        <FadeUp>
          {isLoading ? (
            <div className="bg-white border border-gray-200 shadow-sm mt-8 p-8" style={{ borderRadius: 'var(--radius-sm)' }}>
              <div className="animate-pulse bg-gray-100 h-24 rounded-sm mb-4"></div>
              <div className="animate-pulse bg-gray-100 h-40 rounded-sm"></div>
            </div>
          ) : isError || !ticket ? (
            <div className="bg-white p-10 mt-8 text-center border border-gray-200 shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
              <WarningAmberIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ticket not found</h3>
              <p className="text-gray-500 text-sm mb-6">This ticket may not exist or you don't have access to it.</p>
              <button
                onClick={() => navigate('/my-tickets')}
                className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-sm hover:bg-blue-700 transition-colors text-[13px] tracking-wide uppercase"
              >
                Back to My Tickets
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-6">
              <button
                onClick={() => navigate('/my-tickets')}
                className="self-start flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wide"
              >
                <ArrowBackIcon fontSize="small" /> Back to My Tickets
              </button>

              {/* Ticket header */}
              <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-8" style={{ borderRadius: 'var(--radius-sm)' }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <SupportAgentIcon sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl font-black text-gray-900 tracking-wide" style={{ fontFamily: 'var(--font-admin-mono, monospace)' }}>
                          {ticket.ticketNumber || `#${String(ticket._id).slice(-6).toUpperCase()}`}
                        </h1>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${STATUS_STYLES[ticket.status] || STATUS_STYLES.open}`} style={{ borderRadius: 'var(--radius-sm)' }}>
                          {STATUS_LABELS[ticket.status] || ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mt-1 break-words">{ticket.subject}</p>
                    </div>
                  </div>
                  {!isClosed && (
                    <button
                      onClick={() => closeTicket.mutate()}
                      disabled={closeTicket.isPending}
                      className="flex items-center gap-1.5 border border-red-300 text-red-600 font-bold py-2 px-4 rounded-sm hover:bg-red-50 transition-colors text-[12px] tracking-wide uppercase flex-shrink-0 disabled:opacity-60"
                    >
                      <CloseIcon fontSize="small" /> {closeTicket.isPending ? 'Closing...' : 'Close Ticket'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Issue</div>
                    <div className="text-gray-900 font-bold capitalize">{ticket.issueType || 'General'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Priority</div>
                    <div className="text-gray-900 font-bold capitalize">{ticket.priority || 'Medium'}</div>
                  </div>
                  {ticket.order?.orderNumber && (
                    <div>
                      <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Order</div>
                      <div className="text-gray-900 font-bold">#{ticket.order.orderNumber}</div>
                    </div>
                  )}
                  {assignedName && (
                    <div>
                      <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Assigned To</div>
                      <div className="text-gray-900 font-bold">{assignedName}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Opened</div>
                    <div className="text-gray-900 font-bold">{formatDateTime(ticket.createdAt)}</div>
                  </div>
                </div>
              </div>

              {isClosed && (
                <div className="bg-gray-100 border border-gray-200 p-4 text-center text-[13px] font-bold text-gray-600 uppercase tracking-wider" style={{ borderRadius: 'var(--radius-sm)' }}>
                  This ticket is closed
                </div>
              )}

              {/* Conversation */}
              <div className="flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="bg-white border border-gray-200 shadow-sm p-6 text-center text-gray-500 text-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                    No messages yet.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderRole === 'customer';
                    const senderName = [message.sender?.firstName, message.sender?.lastName].filter(Boolean).join(' ') || (isOwn ? ticket.name : 'RigCraft Support');
                    const roleLabel = isOwn ? 'You' : message.senderRole === 'manager' ? 'Manager' : 'Support Team';
                    return (
                      <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] md:max-w-[70%] px-5 py-4 border shadow-sm ${
                            isOwn ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-900 border-gray-200'
                          }`}
                          style={{ borderRadius: 'var(--radius-sm)' }}
                        >
                          <div className={`flex items-center justify-between gap-4 mb-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            <span className="text-[12px] font-bold uppercase tracking-wider">{roleLabel}{senderName && senderName !== roleLabel ? ` · ${senderName}` : ''}</span>
                            <span className="text-[11px] font-medium">{formatDateTime(message.createdAt)}</span>
                          </div>
                          {message.message && (
                            <p className={`text-[14px] font-medium whitespace-pre-wrap break-words ${isOwn ? 'text-white' : 'text-gray-700'}`}>{message.message}</p>
                          )}
                          {message.attachments?.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
                              {message.attachments.filter((att) => att && att.url).map((att, idx) => (
                                isImageFile(att) ? (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-24 h-24 border rounded-sm overflow-hidden bg-white flex items-center justify-center"
                                  >
                                    <img src={att.url} alt={att.originalName || 'attachment'} className="w-full h-full object-cover" />
                                  </a>
                                ) : (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 hover:bg-gray-100 transition-colors"
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                  >
                                    <AttachFileIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                                    <span className="text-[12px] font-semibold text-gray-800 max-w-[160px] truncate">{att.originalName || 'File'}</span>
                                    {att.size ? <span className="text-[11px] text-gray-500 font-medium">{formatBytes(att.size)}</span> : null}
                                    <span className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm">{fileTypeLabel(att)}</span>
                                  </a>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply box */}
              {!isClosed ? (
                <form onSubmit={handleReplySubmit} className="bg-white border border-gray-200 shadow-sm p-6" style={{ borderRadius: 'var(--radius-sm)' }}>
                  <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-widest mb-1.5">Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="4"
                    placeholder="Type your message..."
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none resize-none"
                  ></textarea>

                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2" style={{ borderRadius: 'var(--radius-sm)' }}>
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded-sm" />
                          ) : (
                            <AttachFileIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                          )}
                          <span className="text-[12px] text-gray-700 font-medium truncate max-w-[180px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <CloseIcon fontSize="small" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyError && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 mt-3">{replyError}</div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-600 hover:text-blue-600 transition-colors uppercase tracking-wide">
                      <AttachFileIcon fontSize="small" />
                      Attach Files
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={sendReply.isPending || !replyText.trim()}
                      className="bg-blue-600 text-white font-bold uppercase tracking-widest text-[13px] py-3 px-6 rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <SendIcon fontSize="small" /> {sendReply.isPending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          )}
        </FadeUp>
      </div>
    </div>
  );
};

export default TicketDetail;

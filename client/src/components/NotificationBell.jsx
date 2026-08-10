import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useNotifications } from '../context/NotificationContext';
import { timeAgo } from '../utils/timeAgo';

const TYPE_CONFIG = {
  order: { color: '#3B82F6', bg: '#EFF6FF', label: 'Order' },
  payment: { color: '#8B5CF6', bg: '#F5F3FF', label: 'Payment' },
  review: { color: '#06B6D4', bg: '#ECFEFF', label: 'Review' },
  support: { color: '#F59E0B', bg: '#FFFBEB', label: 'Support' },
  inventory: { color: '#10B981', bg: '#ECFDF5', label: 'Stock' },
  coupon: { color: '#EC4899', bg: '#FDF2F8', label: 'Coupon' },
  system: { color: '#6B7280', bg: '#F3F4F6', label: 'System' },
  marketing: { color: '#F97316', bg: '#FFF7ED', label: 'Offer' },
};

const formatCount = (n) => (n > 99 ? '99+' : n);

const NotificationBell = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { unreadCount, refetchUnreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => notificationService.getNotifications({ page: 1, limit: 6 }),
    enabled: open,
    staleTime: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      refetchUnreadCount();
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      refetchUnreadCount();
    },
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleRowClick = (notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id, {
        onSuccess: () => queryClient.setQueryData(['notifications', 'preview'], (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n
            ),
          };
        }),
      });
    }
    if (notification.actionUrl) {
      setOpen(false);
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center cursor-pointer pb-1 pt-1" ref={rootRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          if (!open) refetch();
          setOpen((o) => !o);
        }}
        className="hover:text-[var(--color-primary)] transition-colors flex flex-col items-center cursor-pointer"
        style={{ color: 'var(--color-text)' }}
      >
        <div className="relative">
          <NotificationsNoneIcon sx={{ fontSize: 24 }} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[var(--color-danger)] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
              {formatCount(unreadCount)}
            </span>
          )}
        </div>
        <span className="text-[12px] font-bold mt-0.5">Alerts</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-[15px]" style={{ color: 'var(--color-text)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllMutation.mutate()}
                  className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <DoneAllIcon sx={{ fontSize: 16 }} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {isLoading && (
                <div className="flex flex-col gap-3 p-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-200 mt-2" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isError && (
                <div className="p-6 text-center text-sm text-gray-400">
                  Could not load notifications.
                </div>
              )}

              {!isLoading && !isError && (data?.notifications?.length || 0) === 0 && (
                <div className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <NotificationsNoneIcon sx={{ fontSize: 24, color: '#9CA3AF' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">You're all caught up</p>
                  <p className="text-xs text-gray-400 mt-1">Order, payment and support updates will appear here.</p>
                </div>
              )}

              {!isLoading && !isError && (data?.notifications?.length || 0) > 0 && (
                <ul>
                  {data.notifications.map((notification) => {
                    const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => handleRowClick(notification)}
                          className="w-full text-left px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3"
                        >
                          <div className="pt-1.5">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0 block"
                              style={{ backgroundColor: notification.isRead ? '#D1D5DB' : config.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0"
                                style={{ color: config.color, backgroundColor: config.bg }}
                              >
                                {config.label}
                              </span>
                              <span className="text-[11px] text-gray-400 flex-shrink-0">{timeAgo(notification.createdAt)}</span>
                            </div>
                            <p
                              className={`text-[13px] leading-snug ${notification.isRead ? 'text-gray-500' : 'text-gray-800 font-semibold'}`}
                            >
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-gray-400 leading-snug mt-0.5 line-clamp-2">{notification.message}</p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="w-full py-3 text-sm font-semibold border-t border-[var(--color-border)] hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
            >
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

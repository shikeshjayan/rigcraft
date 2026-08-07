import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import FadeUp from '../components/FadeUp';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import { useToast } from '../components/toast/useToast';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { timeAgo } from '../utils/timeAgo';

const ITEMS_PER_PAGE = 10;

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

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { refetchUnreadCount } = useNotifications();
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['notifications', { page, limit: ITEMS_PER_PAGE }],
    queryFn: () => notificationService.getNotifications({ page, limit: ITEMS_PER_PAGE }),
    enabled: isLoggedIn,
    keepPreviousData: true,
  });

  const invalidate = () => {
    queryClient.invalidateQueries(['notifications']);
    refetchUnreadCount();
  };

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: invalidate,
    onError: () => toast('Failed to mark as read.', 'error'),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: invalidate,
    onError: () => toast('Failed to mark all as read.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => {
      invalidate();
      toast('Notification deleted.');
    },
    onError: () => toast('Failed to delete notification.', 'error'),
  });

  const notifications = data?.notifications || [];
  const totalPages = Math.max(1, data?.pagination?.pages || 1);
  const unreadCount = data?.unreadCount || 0;

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const handleRowClick = (notification) => {
    if (!notification.isRead) markReadMutation.mutate(notification.id);
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  return (
    <FadeUp delay={0.1}>
      <div className="w-full min-h-screen bg-white py-12 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Notifications' }]} />

          {!isLoggedIn ? (
            <div className="text-center py-20">
              <NotificationsNoneIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
              <h2 className="text-2xl font-bold text-[#282C3F] mb-3">You're not signed in</h2>
              <p className="text-[#696E79] mb-8">Sign in to see your order, payment and support notifications.</p>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                SIGN IN
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#EAEAEC] shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 border-b border-[#EAEAEC]">
                <div className="flex items-center gap-3">
                  <NotificationsNoneIcon sx={{ fontSize: 32, color: 'var(--color-primary)' }} />
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-[#282C3F] uppercase tracking-wide">Notifications</h1>
                    <p className="text-sm text-[#696E79] font-medium">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
                    </p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--color-primary)] hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <DoneAllIcon sx={{ fontSize: 18 }} />
                    Mark all read
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-4 p-6">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-sm" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm mb-4">Failed to load notifications. Please try again later.</p>
                  <button
                    onClick={() => queryClient.invalidateQueries(['notifications'])}
                    className="border border-[#D4D5D9] text-[#282C3F] font-bold py-2.5 px-6 hover:bg-gray-50 transition-colors text-[13px] tracking-wide uppercase"
                  >
                    Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16">
                  <NotificationsNoneIcon sx={{ fontSize: 64, color: '#CBD5E1' }} className="mb-4" />
                  <h3 className="text-lg font-bold text-[#282C3F] mb-2">No notifications yet</h3>
                  <p className="text-[#696E79] text-sm mb-6">Order, payment and support updates will show up here.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold tracking-wide hover:opacity-90 transition-opacity"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <>
                  <div className={`${isFetching ? 'opacity-60 pointer-events-none' : ''} transition-opacity`}>
                    <ul className="divide-y divide-[#EAEAEC]">
                      {notifications.map((notification) => {
                        const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
                        return (
                          <li key={notification.id}>
                            <div className="flex items-start gap-4 p-5 md:px-8 hover:bg-gray-50 transition-colors group">
                              <button
                                type="button"
                                onClick={() => handleRowClick(notification)}
                                className="flex items-start gap-4 flex-1 min-w-0 text-left cursor-pointer"
                              >
                                <span className="mt-1.5 flex-shrink-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full block"
                                    style={{ backgroundColor: notification.isRead ? '#D1D5DB' : config.color }}
                                  />
                                </span>
                                <span className="flex-1 min-w-0">
                                  <span className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span
                                      className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                                      style={{ color: config.color, backgroundColor: config.bg }}
                                    >
                                      {config.label}
                                    </span>
                                    <span className="text-[11px] text-gray-400">{timeAgo(notification.createdAt)}</span>
                                  </span>
                                  <span
                                    className={`block text-[14px] leading-snug ${notification.isRead ? 'text-[#696E79]' : 'text-[#282C3F] font-bold'}`}
                                  >
                                    {notification.title}
                                  </span>
                                  {notification.message && (
                                    <span className="block text-[13px] text-[#696E79] leading-snug mt-0.5">
                                      {notification.message}
                                    </span>
                                  )}
                                </span>
                              </button>
                              <button
                                type="button"
                                aria-label="Delete notification"
                                onClick={() => deleteMutation.mutate(notification.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-sm hover:bg-gray-100 text-gray-400 hover:text-red-600 cursor-pointer flex-shrink-0"
                              >
                                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {totalPages > 1 && (
                    <div className="border-t border-[#EAEAEC] p-4">
                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </FadeUp>
  );
};

export default Notifications;

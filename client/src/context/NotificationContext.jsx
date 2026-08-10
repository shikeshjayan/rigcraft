import { createContext, useContext, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { connectSocket, socket } from '../shared/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: notificationService.getUnreadCount,
    enabled: isLoggedIn,
    initialData: 0,
  });

  const handleNewNotification = useCallback(() => {
    refetchUnreadCount();
    queryClient.invalidateQueries(['notifications']);
  }, [refetchUnreadCount, queryClient]);

  useEffect(() => {
    if (!isLoggedIn) return;

    connectSocket();

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [isLoggedIn, handleNewNotification]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

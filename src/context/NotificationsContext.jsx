import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

const NotificationsContext = createContext(null);

const CACHE_KEY = 'ef_notifications_cache';

// Lee el último conteo conocido de sessionStorage para pintar algo real
// en el primer render, en vez de arrancar siempre en 0.
const readCache = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const writeCache = (list) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // sessionStorage puede fallar en modo privado; no es crítico.
  }
};

export const NotificationsProvider = ({ children }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const clientId = localStorage.getItem('client_id');

  const [notifications, setNotifications] = useState(readCache);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [markingReadId, setMarkingReadId] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const { socket } = useSocket();

  const updateNotifications = useCallback((updater) => {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeCache(next);
      return next;
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token || !clientId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${apiUrl}/notifications/?status=0&destination_id=${clientId}`,
        config
      );
      if (response.status === 200) {
        updateNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [apiUrl, token, clientId, updateNotifications]);

  // Se hace una sola vez al montar el Provider (nivel app), no en cada página.
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Notificaciones en tiempo real vía socket, disponibles en toda la app.
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      updateNotifications((prev) => [
        typeof data === 'object' ? data : { id: Date.now(), message: data },
        ...prev,
      ]);
      const current_id = Number(localStorage.getItem('client_id'));
      if(current_id === data.destination_id){
        toast.success(data.message);
      }
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket, updateNotifications]);

  const openNotificationsModal = () => setShowNotificationsModal(true);
  const closeNotificationsModal = () => setShowNotificationsModal(false);

  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;
    setMarkingReadId(notificationId);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `${apiUrl}/notifications/${notificationId}/status`,
        { status: '1' },
        config
      );
      if (response.status === 200) {
        updateNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success('Notificación marcada como leída');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('No se pudo marcar la notificación como leída');
    } finally {
      setMarkingReadId(null);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const unreadIds = notifications
      .filter(
        (n) =>
          String(n.status) !== '1' &&
          String(n.status).toLowerCase() !== 'read' &&
          String(n.status).toLowerCase() !== 'leído'
      )
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    setMarkingAllRead(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `${apiUrl}/notifications/status`,
        { ids: unreadIds, status: '1' },
        config
      );
      if (response.status === 200) {
        updateNotifications((prev) => prev.filter((n) => !unreadIds.includes(n.id)));
        toast.success('Todas las notificaciones fueron marcadas como leídas');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('No se pudieron marcar todas las notificaciones como leídas');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const value = {
    notifications,
    showNotificationsModal,
    openNotificationsModal,
    closeNotificationsModal,
    markingReadId,
    markingAllRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refetchNotifications: fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de <NotificationsProvider>');
  }
  return ctx;
};

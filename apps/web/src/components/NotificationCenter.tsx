import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  PackageX,
  CreditCard,
  Clock,
  Package,
  Info,
} from 'lucide-react';
import { notificationsApi } from '../lib/api';
import type { NotificationItem } from '../lib/api';
import './NotificationCenter.css';

const TYPE_ICONS: Record<string, typeof Bell> = {
  STOCK_ALERT: AlertTriangle,
  STOCK_OUT: PackageX,
  INVOICE_PAID: CreditCard,
  INVOICE_OVERDUE: Clock,
  STOCK_MOVEMENT: Package,
  SYSTEM: Info,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'A l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await notificationsApi.count();
      setUnreadCount(res.unreadCount);
    } catch {
      // silent
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list(0, 15);
      setNotifications(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCount]);

  const handleOpen = () => {
    setOpen(true);
    fetchNotifications();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="notif-bell">
      <button
        className="app-header__icon-btn"
        aria-label="Notifications"
        onClick={open ? handleClose : handleOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="notif-overlay" onClick={handleClose} />
          <div className="notif-dropdown">
            <div className="notif-dropdown__header">
              <span className="notif-dropdown__title">Notifications</span>
              {unreadCount > 0 && (
                <button className="notif-dropdown__mark-all" onClick={handleMarkAllRead}>
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="notif-dropdown__list">
              {notifications.length === 0 ? (
                <div className="notif-dropdown__empty">
                  Aucune notification
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Info;
                  return (
                    <div
                      key={n.id}
                      className={`notif-dropdown__item ${!n.read ? 'notif-dropdown__item--unread' : ''}`}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                    >
                      <div className={`notif-dropdown__icon notif-dropdown__icon--${n.type}`}>
                        <Icon size={16} />
                      </div>
                      <div className="notif-dropdown__content">
                        <div className="notif-dropdown__item-title">{n.title}</div>
                        <div className="notif-dropdown__item-message">{n.message}</div>
                        <div className="notif-dropdown__item-time">{timeAgo(n.createdAt)}</div>
                      </div>
                      {!n.read && <div className="notif-dropdown__unread-dot" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

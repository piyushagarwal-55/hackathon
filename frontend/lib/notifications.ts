export type NotificationType = 'market_ending' | 'market_ended' | 'you_won' | 'reputation_milestone' | 'new_market' | 'comment_reply';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  marketEnding: boolean;
  marketEnded: boolean;
  reputationMilestones: boolean;
  newMarkets: boolean;
  commentReplies: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  marketEnding: true,
  marketEnded: true,
  reputationMilestones: true,
  newMarkets: false,
  commentReplies: true,
};

// Local Storage Keys
const NOTIFICATIONS_KEY = 'repvote_notifications';
const PREFERENCES_KEY = 'repvote_notification_preferences';
const PERMISSION_REQUESTED_KEY = 'repvote_notification_permission_requested';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  localStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');
  return permission;
}

export function hasRequestedPermission(): boolean {
  return localStorage.getItem(PERMISSION_REQUESTED_KEY) === 'true';
}

export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!canSendNotifications()) return;

  try {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

export function getNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    read: false,
  };

  const notifications = getNotifications();
  notifications.unshift(newNotification);

  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));

  // Send browser notification
  const prefs = getPreferences();
  if (prefs.enabled && canSendNotifications()) {
    sendBrowserNotification(notification.title, {
      body: notification.message,
      tag: newNotification.id,
    });
  }

  return newNotification;
}

export function markAsRead(notificationId: string) {
  const notifications = getNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function markAllAsRead() {
  const notifications = getNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function deleteNotification(notificationId: string) {
  const notifications = getNotifications();
  const filtered = notifications.filter((n) => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
}

export function clearAllNotifications() {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
}

export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter((n) => !n.read).length;
}

export function getPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: NotificationPreferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    market_ending: '⏰',
    market_ended: '🏁',
    you_won: '🎉',
    reputation_milestone: '⭐',
    new_market: '📊',
    comment_reply: '💬',
  };
  return icons[type] || '🔔';
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    market_ending: 'text-amber-400',
    market_ended: 'text-slate-400',
    you_won: 'text-emerald-400',
    reputation_milestone: 'text-purple-400',
    new_market: 'text-blue-400',
    comment_reply: 'text-pink-400',
  };
  return colors[type] || 'text-slate-400';
}


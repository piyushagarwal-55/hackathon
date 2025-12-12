'use client';

import { useState, useEffect } from 'react';
import { useWatchContractEvent, useAccount } from 'wagmi';
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from '@/lib/contracts';

interface Notification {
  id: string;
  type: 'poll_created' | 'vote_cast' | 'poll_ended';
  message: string;
  timestamp: number;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();

  // Watch for PollCreated events
  useWatchContractEvent({
    address: POLL_FACTORY_ADDRESS,
    abi: POLL_FACTORY_ABI,
    eventName: 'PollCreated',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const notification: Notification = {
          id: `${log.transactionHash}-${log.logIndex}`,
          type: 'poll_created',
          message: `New poll created: "${log.args.question}"`,
          timestamp: Date.now(),
          read: false,
        };
        setNotifications((prev) => [notification, ...prev]);
      });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'poll_created':
        return '📊';
      case 'vote_cast':
        return '🗳️';
      case 'poll_ended':
        return '🏁';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-gradient-to-br from-slate-900 to-purple-900 border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                <p className="text-xs text-gray-400">
                  {unreadCount} unread
                </p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-3">🔕</div>
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                  <p className="text-gray-500 text-xs mt-1">
                    You'll be notified about new polls and votes
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-indigo-500/10' : ''
                      }`}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n.id === notification.id ? { ...n, read: true } : n
                          )
                        );
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="text-2xl">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}




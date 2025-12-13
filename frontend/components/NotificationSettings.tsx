'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import {
  getPreferences,
  savePreferences,
  requestNotificationPermission,
  canSendNotifications,
  NotificationPreferences,
} from '@/lib/notifications';

interface NotificationSettingsProps {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(getPreferences());
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Notification Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Browser Permission */}
          {!canSendNotifications() && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-400 mb-3">
                {permission === 'denied'
                  ? 'Browser notifications are blocked. Please enable them in your browser settings.'
                  : 'Enable browser notifications to receive real-time updates.'}
              </p>
              {permission !== 'denied' && (
                <button
                  onClick={handleRequestPermission}
                  className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-semibold transition-all"
                >
                  Enable Notifications
                </button>
              )}
            </div>
          )}

          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Enable Notifications</h4>
              <p className="text-xs text-slate-400">Master switch for all notifications</p>
            </div>
            <button
              onClick={() => handleToggle('enabled')}
              className={`relative w-12 h-6 rounded-full transition-all ${
                preferences.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Individual Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-white">Notification Types</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Market Ending Soon</p>
                  <p className="text-xs text-slate-400">Get notified before markets close</p>
                </div>
                <button
                  onClick={() => handleToggle('marketEnding')}
                  disabled={!preferences.enabled}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    preferences.marketEnding && preferences.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${!preferences.enabled ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.marketEnding ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Market Ended</p>
                  <p className="text-xs text-slate-400">Know when markets you voted in end</p>
                </div>
                <button
                  onClick={() => handleToggle('marketEnded')}
                  disabled={!preferences.enabled}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    preferences.marketEnded && preferences.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${!preferences.enabled ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.marketEnded ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Reputation Milestones</p>
                  <p className="text-xs text-slate-400">Celebrate level ups and achievements</p>
                </div>
                <button
                  onClick={() => handleToggle('reputationMilestones')}
                  disabled={!preferences.enabled}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    preferences.reputationMilestones && preferences.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${!preferences.enabled ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.reputationMilestones ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">New Markets</p>
                  <p className="text-xs text-slate-400">Discover new markets in your categories</p>
                </div>
                <button
                  onClick={() => handleToggle('newMarkets')}
                  disabled={!preferences.enabled}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    preferences.newMarkets && preferences.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${!preferences.enabled ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.newMarkets ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Comment Replies</p>
                  <p className="text-xs text-slate-400">When someone replies to your comments</p>
                </div>
                <button
                  onClick={() => handleToggle('commentReplies')}
                  disabled={!preferences.enabled}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    preferences.commentReplies && preferences.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                  } ${!preferences.enabled ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.commentReplies ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


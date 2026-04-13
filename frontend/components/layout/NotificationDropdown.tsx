'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';

type NotificationItem = {
  id: number;
  text: string;
  time: string;
  unread?: boolean;
};

type NotificationDropdownProps = {
  isOpen: boolean;
  notifications: NotificationItem[];
  title?: string;
};

export function NotificationDropdown({
  isOpen,
  notifications,
  title = 'Notifications',
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 z-50"
        >
          <div className="w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="border-b border-border bg-gradient-to-r from-accent/30 to-accent/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
                  >
                    <div className="pt-1">
                      <span
                        className={`block h-2.5 w-2.5 rounded-full ${
                          notification.unread ? 'bg-destructive' : 'bg-muted'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-5 text-foreground">
                        {notification.text}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                    <CheckCheck className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No new notifications</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    New scheduling updates will show up here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

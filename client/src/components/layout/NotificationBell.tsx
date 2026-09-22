import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '../../api/endpoints/notifications.api';
import { DASHBOARD_POLL_INTERVAL_MS } from '../../hooks/usePolling';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.listNotifications,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative text-sm text-gray-600 hover:text-gray-900">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {data?.length === 0 && <p className="p-3 text-sm text-gray-400">No notifications.</p>}
            {data?.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={`cursor-pointer border-b border-gray-100 p-3 text-xs ${n.isRead ? 'text-gray-400' : 'bg-blue-50'}`}
              >
                <p className="font-medium">{n.type}</p>
                <p className="mt-0.5 truncate">{JSON.stringify(n.payload)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

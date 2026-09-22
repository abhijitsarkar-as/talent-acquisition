import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SseEvent } from '@ta/shared';
import { getToken } from '../api/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4100';

/**
 * Subscribes to the server's SSE stream and treats every event as a thin
 * invalidation signal — it never trusts the payload as data, it just tells
 * React Query "something changed, refetch the reporting queries." The
 * actual aggregate always comes from the normal REST endpoints.
 */
export function useLiveEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const source = new EventSource(`${API_BASE_URL}/api/events/stream?token=${encodeURIComponent(token)}`);

    source.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as SseEvent;
        if (event.type === 'STATE_TRANSITION') {
          queryClient.invalidateQueries({ queryKey: ['reporting'] });
          queryClient.invalidateQueries({ queryKey: ['requisitions'] });
          queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
      } catch {
        // ignore malformed/keepalive frames
      }
    };

    return () => source.close();
  }, [queryClient]);
}

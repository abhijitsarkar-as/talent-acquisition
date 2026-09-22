import type { Response } from 'express';
import type { SseEvent } from '@ta/shared';

interface Connection {
  userId: string;
  res: Response;
}

const connections: Connection[] = [];

export function subscribe(userId: string, res: Response) {
  connections.push({ userId, res });
}

export function unsubscribe(res: Response) {
  const idx = connections.findIndex((c) => c.res === res);
  if (idx !== -1) connections.splice(idx, 1);
}

/**
 * Broadcasts a thin invalidation signal to every connected dashboard client
 * — the client refetches the real aggregate from the REST reporting
 * endpoints rather than trusting this payload as data. In-memory and
 * single-process, matching the rest of this app's dev-mode session-store
 * philosophy; the seam to swap for Postgres LISTEN/NOTIFY if ever
 * horizontally scaled.
 */
export function broadcast(event: SseEvent) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const conn of connections) {
    conn.res.write(payload);
  }
}

export function connectionCount() {
  return connections.length;
}

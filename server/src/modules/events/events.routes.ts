import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../../config/env';
import { subscribe, unsubscribe } from './events.hub';

export const eventsRouter = Router();

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

// Browser EventSource can't set custom headers, so the token travels as a
// query param on this one route instead of the usual Authorization header.
eventsRouter.get('/stream', (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(401).end();
    return;
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    res.status(401).end();
    return;
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write(': connected\n\n');

  subscribe(payload.id, res);

  req.on('close', () => unsubscribe(res));
});

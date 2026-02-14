import { ok, requireDiscord, verifyTurnstile } from '$lib/server/http';
import { createHmac } from 'node:crypto';
import { getOrCreateSession } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const session = getOrCreateSession(event.locals.sessionId);
  session.user = { id: user.id, username: user.username };
  session.nsfwAccepted = true;

  if (event.locals.user && process.env.SESSION_SECRET) {
    const payload = JSON.stringify({
      id: event.locals.user.id,
      username: event.locals.user.username,
      nsfwAcceptedAt: new Date().toISOString()
    });

    const signature = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex');
    const signed = Buffer.from(`${payload}.${signature}`).toString('base64');

    event.cookies.set('session', signed, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
  }

  return ok({ ok: true, userId: user.id, nsfwAccepted: true });
};

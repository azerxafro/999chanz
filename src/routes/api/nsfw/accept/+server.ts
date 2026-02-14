import { ok, requireDiscord, verifyTurnstile } from '$lib/server/http';
import { getOrCreateSession } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const session = getOrCreateSession(event.locals.sessionId);
  session.user = user;
  session.nsfwAccepted = true;

  return ok({ ok: true, userId: user.id, nsfwAccepted: true });
};

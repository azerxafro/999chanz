import { ok, fail, parseJson, requireDiscord, verifyTurnstile } from '$lib/server/http';
import { reports } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = { targetType: string; targetId: string; reason: string };

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (!payload?.targetType || !payload.targetId || !payload.reason) return fail('invalid payload', 400);

  const id = crypto.randomUUID();
  reports.push({
    id,
    targetType: payload.targetType,
    targetId: payload.targetId,
    reason: payload.reason,
    reporterId: user.id,
    status: 'open'
  });

  return ok({ ok: true, id }, 201);
};

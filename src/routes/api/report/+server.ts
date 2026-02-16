import { ok, fail, parseJson, requireDiscord, verifyTurnstile } from '$lib/server/http';
import { createReport } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = { targetType: string; targetId: string; reason: string };

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (!payload?.targetType || !payload.targetId || !payload.reason) return fail('invalid payload', 400);

  await createReport(payload.targetType, payload.targetId, payload.reason, user.id);
  return ok({ ok: true }, 201);
};

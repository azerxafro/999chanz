import { ok, fail, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { getThread, createPost } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = { threadId: string; body: string };

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (!payload?.threadId || !payload.body?.trim()) return fail('invalid payload', 400);

  const thread = await getThread(payload.threadId);
  if (!thread) return fail('thread not found', 404);

  if (thread.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const post = await createPost(
    thread.id,
    user.id,
    user.username,
    payload.body
  );

  return ok({ ok: true, postId: post.id }, 201);
};

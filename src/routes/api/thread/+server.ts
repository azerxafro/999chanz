import { ok, fail, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { getBoard, createThread } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = {
  boardSlug: string;
  title: string;
  body: string;
  nsfw?: boolean;
};

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (!payload?.boardSlug || !payload.title || !payload.body) return fail('invalid payload', 400);

  const board = await getBoard(payload.boardSlug);
  if (!board) return fail('board not found', 404);

  if (board.nsfw || payload.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const thread = await createThread(
    payload.boardSlug,
    payload.title,
    payload.body,
    user.id,
    user.username,
    Boolean(payload.nsfw || board.nsfw)
  );

  return ok({ id: thread.id }, 201);
};

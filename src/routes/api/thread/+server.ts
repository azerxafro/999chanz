import { ok, fail, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { boards, threads } from '$lib/server/state';
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

  const board = boards.find((entry) => entry.slug === payload.boardSlug);
  if (!board) return fail('board not found', 404);

  if (board.nsfw || payload.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const id = String(Date.now());
  threads.unshift({
    id,
    boardSlug: payload.boardSlug,
    title: payload.title,
    nsfw: Boolean(payload.nsfw || board.nsfw),
    createdAt: Date.now(),
    posts: [
      {
        id: `${id}-p1`,
        threadId: id,
        authorId: user.id,
        authorName: user.username,
        body: payload.body,
        createdAt: Date.now()
      }
    ]
  });

  return ok({ id }, 201);
};

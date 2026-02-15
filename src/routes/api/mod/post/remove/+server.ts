import { fail, ok, parseJson, requireRole } from '$lib/server/http';
import { findPost } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = {
  postId: string;
};

export const POST: RequestHandler = async (event) => {
  const user = requireRole(event, 'mod');
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (!payload?.postId) return fail('invalid payload', 400);

  const post = findPost(payload.postId);
  if (!post) return fail('post not found', 404);
  if (post.removed) return fail('post already removed', 409);

  post.removed = {
    actedBy: user.id,
    actedAt: Date.now()
  };

  return ok({ ok: true, postId: post.id });
};

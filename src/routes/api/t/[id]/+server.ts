import { ok, fail, requireNsfwAccepted } from '$lib/server/http';
import { getThread } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const { params } = event;
  const thread = await getThread(params.id);
  if (!thread) return fail('thread not found', 404);

  if (thread.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  return ok(thread);
};

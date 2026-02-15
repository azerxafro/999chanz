import { ok, fail, requireNsfwAccepted } from '$lib/server/http';
import { threads } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
  const thread = threads.find((entry) => entry.id === event.params.id);
  if (!thread) return fail('thread not found', 404);

  if (thread.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  return ok(thread);
};

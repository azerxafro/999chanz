import { fail, ok, parseJson, requireRole } from '$lib/server/http';
import { mediaRecords } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = {
  mediaId: string;
};

export const POST: RequestHandler = async (event) => {
  const user = requireRole(event, 'mod');
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (!payload?.mediaId) return fail('invalid payload', 400);

  const media = mediaRecords.find((entry) => entry.id === payload.mediaId);
  if (!media) return fail('media not found', 404);
  if (media.removed) return fail('media already removed', 409);

  media.removed = {
    actedBy: user.id,
    actedAt: Date.now()
  };

  return ok({ ok: true, mediaId: media.id });
};

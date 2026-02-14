import { ok, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { mediaDrafts } from '$lib/server/state';
import { makeBlobUploadTarget } from '$lib/server/media';
import type { RequestHandler } from './$types';

type Payload = { nsfw?: boolean };

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const payload = (await parseJson<Payload>(event)) ?? {};

  if (payload.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const draftId = crypto.randomUUID();
  const target = makeBlobUploadTarget(user.id, draftId);

  mediaDrafts.set(draftId, {
    draftId,
    userId: user.id,
    createdAt: Date.now(),
    committed: false,
    token: target.token,
    uploadUrl: target.uploadUrl,
    objectKey: target.objectKey,
    nsfw: Boolean(payload.nsfw)
  });

  return ok(
    {
      draftId,
      upload: {
        provider: 'vercel-blob',
        uploadUrl: target.uploadUrl,
        token: target.token,
        objectKey: target.objectKey,
        expiresInSeconds: 600
      }
    },
    201
  );
};

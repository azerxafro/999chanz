import { ok, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { makeBlobUploadTarget } from '$lib/server/media';
import { mediaDrafts } from '$lib/server/state';
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
  const target = await makeBlobUploadTarget(user.id, draftId);

  mediaDrafts.set(draftId, {
    draftId,
    userId: user.id,
    createdAt: Date.now(),
    expiresAt: target.expiresAt,
    committed: false,
    token: target.token,
    objectKey: target.objectKey,
    provider: 'vercel-blob',
    providerMetadata: target.providerMetadata,
    nsfw: Boolean(payload.nsfw)
  });

  return ok(
    {
      draftId,
      upload: {
        provider: 'vercel-blob',
        token: target.token,
        objectKey: target.objectKey,
        expiresAt: target.expiresAt,
        expiresInSeconds: target.expiresInSeconds,
        metadata: target.providerMetadata
      }
    },
    201
  );
};

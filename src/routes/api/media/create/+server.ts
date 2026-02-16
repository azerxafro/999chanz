import { ok, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { createMediaDraft } from '$lib/server/state';
import { createSignedUploadUrl } from '$lib/server/media';
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
  const upload = await createSignedUploadUrl(user.id, draftId);

  await createMediaDraft({
    draft_id: draftId,
    user_id: user.id,
    committed: false,
    object_key: upload.objectKey,
    nsfw: Boolean(payload.nsfw)
  });

  return ok(
    {
      draftId,
      upload: {
        provider: 'supabase-storage',
        signedUrl: upload.signedUrl,
        token: upload.token,
        objectKey: upload.objectKey,
        expiresInSeconds: 600
      }
    },
    201
  );
};

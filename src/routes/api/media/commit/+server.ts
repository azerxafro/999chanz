import { ok, fail, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { detectMimeFromMagic } from '$lib/server/media';
import { hasPost, mediaDrafts, mediaRecords } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = {
  draftId: string;
  postId: string;
  blobUrl: string;
  sizeBytes: number;
  sha256: string;
  magicHeadBase64: string;
};

export const POST: RequestHandler = async (event) => {
  const captcha = await verifyTurnstile(event);
  if (captcha) return captcha;

  const user = requireDiscord(event);
  if (user instanceof Response) return user;

  const payload = await parseJson<Payload>(event);
  if (
    !payload?.draftId ||
    !payload.postId ||
    !payload.blobUrl ||
    !payload.sha256 ||
    !payload.magicHeadBase64 ||
    !Number.isFinite(payload.sizeBytes) ||
    payload.sizeBytes <= 0
  ) {
    return fail('invalid payload', 400);
  }

  const draft = mediaDrafts.get(payload.draftId);
  if (!draft || draft.userId !== user.id) return fail('draft not found', 404);
  if (draft.committed) return fail('draft already committed', 409);
  if (!hasPost(payload.postId)) return fail('post not found', 404);

  if (draft.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const mime = detectMimeFromMagic(payload.magicHeadBase64);
  if (!mime) return fail('unsupported or invalid media signature', 415);

  draft.committed = true;

  const mediaId = crypto.randomUUID();
  mediaRecords.push({
    id: mediaId,
    draftId: draft.draftId,
    objectKey: draft.objectKey,
    url: payload.blobUrl,
    mime,
    sizeBytes: payload.sizeBytes,
    sha256: payload.sha256,
    linkedPostId: payload.postId,
    createdBy: user.id,
    createdAt: Date.now()
  });

  return ok({ ok: true, mediaId, mime, linkedPostId: payload.postId, url: payload.blobUrl }, 201);
};

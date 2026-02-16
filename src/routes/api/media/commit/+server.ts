import { ok, fail, parseJson, requireDiscord, requireNsfwAccepted, verifyTurnstile } from '$lib/server/http';
import { detectMimeFromMagic, getPublicUrl } from '$lib/server/media';
import { hasPost, getMediaDraft, commitMediaDraft, createMediaRecord } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = {
  draftId: string;
  postId: string;
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
    !payload.sha256 ||
    !payload.magicHeadBase64 ||
    !Number.isFinite(payload.sizeBytes) ||
    payload.sizeBytes <= 0
  ) {
    return fail('invalid payload', 400);
  }

  const draft = await getMediaDraft(payload.draftId);
  if (!draft || draft.user_id !== user.id) return fail('draft not found', 404);
  if (draft.committed) return fail('draft already committed', 409);
  if (!(await hasPost(payload.postId))) return fail('post not found', 404);

  if (draft.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const mime = detectMimeFromMagic(payload.magicHeadBase64);
  if (!mime) return fail('unsupported or invalid media signature', 415);

  await commitMediaDraft(payload.draftId);

  const url = getPublicUrl(draft.object_key);
  const mediaId = crypto.randomUUID();
  await createMediaRecord({
    id: mediaId,
    draft_id: draft.draft_id,
    object_key: draft.object_key,
    url,
    mime,
    size_bytes: payload.sizeBytes,
    sha256: payload.sha256,
    linked_post_id: payload.postId,
    created_by: user.id
  });

  return ok({ ok: true, mediaId, mime, linkedPostId: payload.postId, url }, 201);
};

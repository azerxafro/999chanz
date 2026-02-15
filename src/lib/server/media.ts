import { generateClientTokenFromReadWriteToken, getPayloadFromClientToken } from '@vercel/blob/client';
import { env } from '$env/dynamic/private';

const SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }
];

const DEFAULT_UPLOAD_TTL_SECONDS = 600;

function decodeBase64(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(normalized);
  return Uint8Array.from(decoded, (c) => c.charCodeAt(0));
}

export function detectMimeFromMagic(headBase64: string): string | null {
  const bytes = decodeBase64(headBase64);
  for (const signature of SIGNATURES) {
    const matches = signature.bytes.every((byte, index) => bytes[index] === byte);
    if (matches) {
      if (signature.mime === 'image/webp' && String.fromCharCode(...bytes.slice(8, 12)) !== 'WEBP') {
        continue;
      }
      return signature.mime;
    }
  }
  return null;
}

export type BlobUploadTarget = {
  token: string;
  objectKey: string;
  expiresAt: number;
  expiresInSeconds: number;
  providerMetadata: {
    pathname: string;
    storeId: string | null;
    allowedContentTypes?: string[];
  };
};

export async function makeBlobUploadTarget(userId: string, draftId: string): Promise<BlobUploadTarget> {
  const objectKey = `media/${userId}/${draftId}`;
  const requestedTtl = Number(env.BLOB_UPLOAD_TOKEN_TTL_SECONDS ?? DEFAULT_UPLOAD_TTL_SECONDS);
  const expiresInSeconds = Number.isFinite(requestedTtl) && requestedTtl > 0 ? requestedTtl : DEFAULT_UPLOAD_TTL_SECONDS;
  const expiresAt = Date.now() + expiresInSeconds * 1000;

  const token = await generateClientTokenFromReadWriteToken({
    token: env.BLOB_READ_WRITE_TOKEN,
    pathname: objectKey,
    validUntil: expiresAt,
    addRandomSuffix: false,
    allowOverwrite: false
  });

  const decoded = getPayloadFromClientToken(token);

  return {
    token,
    objectKey,
    expiresAt,
    expiresInSeconds,
    providerMetadata: {
      pathname: decoded.pathname,
      storeId: token.split('_')[3] ?? null,
      allowedContentTypes: decoded.allowedContentTypes
    }
  };
}

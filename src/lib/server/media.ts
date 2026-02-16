import { supabase } from './supabase';

const SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }
];

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

export async function createSignedUploadUrl(userId: string, draftId: string) {
  const objectKey = `${userId}/${draftId}`;

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(objectKey);

  if (error) throw error;

  return {
    objectKey,
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path
  };
}

export function getPublicUrl(objectKey: string): string {
  const { data } = supabase.storage.from('media').getPublicUrl(objectKey);
  return data.publicUrl;
}

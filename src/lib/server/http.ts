import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getOrCreateSession } from './state';

export function ok(data: unknown, status = 200) {
  return json(data, { status });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, { status });
}

export async function parseJson<T>(event: Pick<RequestEvent, 'request'>): Promise<T | null> {
  if (!event.request.headers.get('content-type')?.includes('application/json')) {
    return null;
  }

  try {
    return (await event.request.json()) as T;
  } catch {
    return null;
  }
}

export function requireDiscord(event: { locals: App.Locals }) {
  const session = getOrCreateSession(event.locals.sessionId);
  const user = event.locals.user ?? event.locals.discordUser;
  if (!user) return fail('discord login required', 401);
  session.user = { id: user.id, username: user.username };
  return user;
}

export function requireNsfwAccepted(event: { locals: App.Locals }) {
  const auth = requireDiscord(event);
  if (auth instanceof Response) return auth;

  if (event.locals.user?.nsfwAcceptedAt) {
    return null;
  }

  const session = getOrCreateSession(event.locals.sessionId);
  if (!session.nsfwAccepted) return fail('Age verification required', 403);
  return null;
}

export async function verifyTurnstile(event: Pick<RequestEvent, 'request' | 'platform'>) {
  const secret = event.platform?.env?.TURNSTILE_SECRET as string | undefined;
  if (!secret) return null;

  const token = event.request.headers.get('x-turnstile-token');
  if (!token) return fail('missing turnstile token', 400);

  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });

  const result = (await verifyRes.json()) as { success?: boolean };
  if (!result.success) return fail('turnstile verification failed', 403);
  return null;
}

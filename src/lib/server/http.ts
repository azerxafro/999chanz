import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getOrCreateSession } from './state';

const roleOrder: Record<App.UserRole, number> = {
  user: 0,
  mod: 1,
  admin: 2
};

export function ok(data: unknown, status = 200) {
  return json(data, { status });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, { status });
}

export async function parseJson<T>(event: RequestEvent): Promise<T | null> {
  if (!event.request.headers.get('content-type')?.includes('application/json')) {
    return null;
  }

  try {
    return (await event.request.json()) as T;
  } catch {
    return null;
  }
}

export function requireDiscord(event: RequestEvent) {
  const session = getOrCreateSession(event.locals.sessionId);
  const user = event.locals.user;
  if (!user) return fail('discord login required', 401);
  session.user = user;
  return user;
}

export function requireRole(event: RequestEvent, role: App.UserRole) {
  const user = requireDiscord(event);
  if (user instanceof Response) return user;
  if (roleOrder[user.role] < roleOrder[role]) return fail(`${role} role required`, 403);
  return user;
}

export function requireNsfwAccepted(event: RequestEvent) {
  const auth = requireDiscord(event);
  if (auth instanceof Response) return auth;

  const session = getOrCreateSession(event.locals.sessionId);
  if (!session.nsfwAccepted) return fail('nsfw gate not accepted', 403);
  return null;
}

export async function verifyTurnstile(event: RequestEvent) {
  const platformEnv = (event.platform as { env?: { TURNSTILE_SECRET?: string } } | null)?.env;
  const secret = platformEnv?.TURNSTILE_SECRET;
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

import type { Handle, HandleServerError } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';

function extractDiscordUser(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer discord:')) {
    const id = auth.replace('Bearer discord:', '').trim();
    if (id) return { id, username: `discord_${id}` };
  }

  const headerUser = request.headers.get('x-discord-user');
  if (headerUser) return { id: headerUser, username: `discord_${headerUser}` };

  return null;
}

function parseSignedSession(session: string, secret: string) {
  const decoded = Buffer.from(session, 'base64').toString();
  const separator = decoded.lastIndexOf('.');
  if (separator <= 0) return null;

  const payload = decoded.slice(0, separator);
  const signature = decoded.slice(separator + 1);

  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  if (signature !== expected) return null;

  return JSON.parse(payload) as { id: string; username: string; nsfwAcceptedAt?: string | null };
}

export const handle: Handle = async ({ event, resolve }) => {
  const sid = event.cookies.get('sid') ?? crypto.randomUUID();
  event.locals.sessionId = sid;
  event.locals.discordUser = extractDiscordUser(event.request);
  event.locals.user = null;

  const sessionCookie = event.cookies.get('session');
  const secret = process.env.SESSION_SECRET;
  if (sessionCookie && secret) {
    try {
      const parsed = parseSignedSession(sessionCookie, secret);
      if (parsed) {
        event.locals.user = parsed;
        event.locals.discordUser = { id: parsed.id, username: parsed.username };
      }
    } catch {
      event.locals.user = null;
    }
  }

  if (event.request.method === 'OPTIONS' && event.url.pathname.startsWith('/api/')) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-discord-user, x-turnstile-token'
      }
    });
  }

  const response = await resolve(event);

  event.cookies.set('sid', sid, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 30
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-discord-user, x-turnstile-token');

  return response;
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
  return {
    message: error instanceof Error ? error.message : 'Internal Server Error'
  };
};

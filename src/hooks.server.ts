import type { Handle, HandleServerError } from '@sveltejs/kit';

const validRoles: App.UserRole[] = ['user', 'mod', 'admin'];

function parseRole(role: string | null): App.UserRole {
  if (!role) return 'user';
  return validRoles.includes(role as App.UserRole) ? (role as App.UserRole) : 'user';
}

function extractDiscordUser(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer discord:')) {
    const payload = auth.replace('Bearer discord:', '').trim();
    const [id, role] = payload.split(':');
    if (id) return { id, username: `discord_${id}`, role: parseRole(role ?? null) };
  }

  const headerUser = request.headers.get('x-discord-user');
  if (headerUser) {
    const role = parseRole(request.headers.get('x-user-role') ?? request.headers.get('x-discord-role'));
    return { id: headerUser, username: `discord_${headerUser}`, role };
  }

  return null;
}

export const handle: Handle = async ({ event, resolve }) => {
  const sid = event.cookies.get('sid') ?? crypto.randomUUID();
  event.locals.sessionId = sid;
  event.locals.user = extractDiscordUser(event.request);


  if (event.request.method === 'OPTIONS' && event.url.pathname.startsWith('/api/')) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-discord-user, x-user-role, x-discord-role, x-turnstile-token'
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
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-discord-user, x-user-role, x-discord-role, x-turnstile-token');

  return response;
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
  return {
    message: error instanceof Error ? error.message : 'Internal Server Error'
  };
};

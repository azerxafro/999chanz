import type { Handle, HandleServerError } from '@sveltejs/kit';

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

export const handle: Handle = async ({ event, resolve }) => {
  const sid = event.cookies.get('sid') ?? crypto.randomUUID();
  event.locals.sessionId = sid;
  event.locals.discordUser = extractDiscordUser(event.request);


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

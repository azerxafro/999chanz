import { json, redirect } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import type { RequestHandler } from './$types';

type DiscordTokenResponse = {
  access_token?: string;
};

type DiscordUser = {
  id: string;
  username: string;
};

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  if (!code) return json({ error: 'Missing code' }, { status: 400 });

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI) {
    return json({ error: 'Missing Discord OAuth configuration' }, { status: 500 });
  }

  if (!process.env.SESSION_SECRET) {
    return json({ error: 'Missing SESSION_SECRET' }, { status: 500 });
  }

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    })
  });

  if (!tokenRes.ok) {
    return json({ error: 'Token exchange failed' }, { status: 502 });
  }

  const tokenData = (await tokenRes.json()) as DiscordTokenResponse;
  const accessToken = tokenData.access_token;
  if (!accessToken) return json({ error: 'Missing access token' }, { status: 502 });

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!userRes.ok) {
    return json({ error: 'Failed to fetch Discord user' }, { status: 502 });
  }

  const discordUser = (await userRes.json()) as DiscordUser;

  const payload = JSON.stringify({
    id: discordUser.id,
    username: discordUser.username,
    nsfwAcceptedAt: null
  });

  const signature = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex');
  const session = Buffer.from(`${payload}.${signature}`).toString('base64');

  cookies.set('session', session, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });

  throw redirect(302, '/');
};

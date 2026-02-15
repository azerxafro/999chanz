# 999chanz SvelteKit API

SvelteKit server routes on the same domain (e.g. `/api/*`) using `+server.ts` handlers.

## API routes
- `GET /api/boards`
- `GET /api/b/:slug`
- `GET /api/t/:id`
- `POST /api/thread`
- `POST /api/post`
- `POST /api/report`
- `POST /api/media/create` (returns signed Blob upload target)
- `POST /api/media/commit` (magic-byte verification + metadata persistence + post link)
- `POST /api/nsfw/accept`

## Middleware and guards
- CORS headers via `src/hooks.server.ts`
- Global error handling via `handleError`
- JSON parsing helper for POST payloads
- Turnstile verification (`x-turnstile-token`) when `TURNSTILE_SECRET` is configured
- Discord login requirement via `Authorization: Bearer discord:<id>` or `x-discord-user`
- NSFW gate requiring Discord login and accepted session state (`/api/nsfw/accept`)

## Notes
- Uses cookie-based session id (`sid`) and in-memory server state for demo purposes.
- Uses `@sveltejs/adapter-vercel` explicitly in `svelte.config.js`.
- Uses `@sveltejs/kit@^2.51.0` + `svelte@^5` to avoid Vercel dependency resolution conflicts.


### Media flow
1. Call `POST /api/media/create` to receive a signed direct-upload target (`uploadUrl`, `token`, `objectKey`).
2. Upload media directly from client to Blob using the returned signed target.
3. Call `POST /api/media/commit` with `draftId`, `postId`, `blobUrl`, `sizeBytes`, `sha256`, and `magicHeadBase64`.
4. Server verifies file signature (magic bytes), stores media metadata, and links media to the post.


## Auth routes
- `GET /auth/discord/start`
- `GET /auth/discord/callback`
- `GET /auth/logout`
- Includes OAuth `state` cookie validation for CSRF protection.

## Required env vars
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `SESSION_SECRET`


## Deployment
- Vercel project: https://vercel.com/atoms-ninja/999chanz/
- After each deploy, update `DISCORD_REDIRECT_URI` to: `https://<your-production-domain>/auth/discord/callback`.

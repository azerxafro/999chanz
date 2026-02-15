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


### Blob environment variables
- `BLOB_READ_WRITE_TOKEN` (required): Vercel Blob read/write token used server-side to mint client upload tokens.
- `BLOB_UPLOAD_TOKEN_TTL_SECONDS` (optional): token lifetime override; defaults to `600`.

### Media flow
1. Client calls `POST /api/media/create` (authenticated + Turnstile as configured).
2. Server creates a draft and returns Vercel Blob client-token metadata: `token`, `objectKey`, `expiresAt`, and provider metadata (`pathname`, `storeId`, etc.).
3. Client uploads directly to Blob using `@vercel/blob/client` and the returned token, for example `put(objectKey, file, { access: 'public', token })`.
4. Client calls `POST /api/media/commit` with `draftId`, `postId`, `blobUrl`, `sizeBytes`, `sha256`, and `magicHeadBase64`.
5. Server rejects expired drafts or URL/object-key mismatches, verifies file signature (magic bytes), then persists media metadata and post linkage.

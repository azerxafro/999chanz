
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/boards" | "/api/b" | "/api/b/[slug]" | "/api/media" | "/api/media/commit" | "/api/media/create" | "/api/nsfw" | "/api/nsfw/accept" | "/api/post" | "/api/report" | "/api/thread" | "/api/t" | "/api/t/[id]" | "/auth" | "/auth/discord" | "/auth/discord/callback" | "/auth/discord/start" | "/auth/logout" | "/b" | "/b/[slug]" | "/create" | "/nsfw" | "/t" | "/t/[id]";
		RouteParams(): {
			"/api/b/[slug]": { slug: string };
			"/api/t/[id]": { id: string };
			"/b/[slug]": { slug: string };
			"/t/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { slug?: string; id?: string };
			"/api": { slug?: string; id?: string };
			"/api/boards": Record<string, never>;
			"/api/b": { slug?: string };
			"/api/b/[slug]": { slug: string };
			"/api/media": Record<string, never>;
			"/api/media/commit": Record<string, never>;
			"/api/media/create": Record<string, never>;
			"/api/nsfw": Record<string, never>;
			"/api/nsfw/accept": Record<string, never>;
			"/api/post": Record<string, never>;
			"/api/report": Record<string, never>;
			"/api/thread": Record<string, never>;
			"/api/t": { id?: string };
			"/api/t/[id]": { id: string };
			"/auth": Record<string, never>;
			"/auth/discord": Record<string, never>;
			"/auth/discord/callback": Record<string, never>;
			"/auth/discord/start": Record<string, never>;
			"/auth/logout": Record<string, never>;
			"/b": { slug?: string };
			"/b/[slug]": { slug: string };
			"/create": Record<string, never>;
			"/nsfw": Record<string, never>;
			"/t": { id?: string };
			"/t/[id]": { id: string }
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/boards" | "/api/boards/" | "/api/b" | "/api/b/" | `/api/b/${string}` & {} | `/api/b/${string}/` & {} | "/api/media" | "/api/media/" | "/api/media/commit" | "/api/media/commit/" | "/api/media/create" | "/api/media/create/" | "/api/nsfw" | "/api/nsfw/" | "/api/nsfw/accept" | "/api/nsfw/accept/" | "/api/post" | "/api/post/" | "/api/report" | "/api/report/" | "/api/thread" | "/api/thread/" | "/api/t" | "/api/t/" | `/api/t/${string}` & {} | `/api/t/${string}/` & {} | "/auth" | "/auth/" | "/auth/discord" | "/auth/discord/" | "/auth/discord/callback" | "/auth/discord/callback/" | "/auth/discord/start" | "/auth/discord/start/" | "/auth/logout" | "/auth/logout/" | "/b" | "/b/" | `/b/${string}` & {} | `/b/${string}/` & {} | "/create" | "/create/" | "/nsfw" | "/nsfw/" | "/t" | "/t/" | `/t/${string}` & {} | `/t/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}
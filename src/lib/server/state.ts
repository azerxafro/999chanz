export type DiscordUser = {
  id: string;
  username: string;
};

export type Session = {
  id: string;
  user: DiscordUser | null;
  nsfwAccepted: boolean;
};

export type Board = {
  slug: string;
  name: string;
  description: string;
  nsfw: boolean;
};

export type Post = {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: number;
};

export type Thread = {
  id: string;
  boardSlug: string;
  title: string;
  nsfw: boolean;
  createdAt: number;
  posts: Post[];
};

export type MediaDraft = {
  draftId: string;
  userId: string;
  createdAt: number;
  committed: boolean;
  token: string;
  uploadUrl: string;
  objectKey: string;
  nsfw: boolean;
};

export type MediaRecord = {
  id: string;
  draftId: string;
  objectKey: string;
  url: string;
  mime: string;
  sizeBytes: number;
  sha256: string;
  linkedPostId: string;
  createdBy: string;
  createdAt: number;
};

export const boards: Board[] = [
  { slug: 'tech', name: 'Technology', description: 'Code and tooling', nsfw: false },
  { slug: 'random', name: 'Random', description: 'Everything else', nsfw: false },
  { slug: 'adults', name: 'Adults', description: 'NSFW content', nsfw: true }
];

export const threads: Thread[] = [
  {
    id: '1001',
    boardSlug: 'tech',
    title: 'Fast web stacks in 2026',
    nsfw: false,
    createdAt: Date.now() - 100_000,
    posts: [
      {
        id: '1001-p1',
        threadId: '1001',
        authorId: 'seed',
        authorName: 'seed',
        body: 'What are you shipping with?',
        createdAt: Date.now() - 100_000
      }
    ]
  }
];

export const reports: Array<{ id: string; targetType: string; targetId: string; reason: string; reporterId: string }> = [];
export const mediaDrafts = new Map<string, MediaDraft>();
export const mediaRecords: MediaRecord[] = [];
export const sessions = new Map<string, Session>();

export function getOrCreateSession(sessionId: string): Session {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created: Session = { id: sessionId, user: null, nsfwAccepted: false };
  sessions.set(sessionId, created);
  return created;
}

export function hasPost(postId: string): boolean {
  return threads.some((thread) => thread.posts.some((post) => post.id === postId));
}

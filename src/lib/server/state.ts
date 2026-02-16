import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────

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
  thread_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type Thread = {
  id: string;
  board_slug: string;
  title: string;
  nsfw: boolean;
  created_at: string;
};

export type MediaDraft = {
  draft_id: string;
  user_id: string;
  created_at: string;
  committed: boolean;
  object_key: string;
  nsfw: boolean;
};

export type MediaRecord = {
  id: string;
  draft_id: string;
  object_key: string;
  url: string;
  mime: string;
  size_bytes: number;
  sha256: string;
  linked_post_id: string;
  created_by: string;
  created_at: string;
};

// ── Sessions (in-memory — ephemeral per-instance) ──────

export const sessions = new Map<string, Session>();

export function getOrCreateSession(sessionId: string): Session {
  const existing = sessions.get(sessionId);
  if (existing) return existing;
  const created: Session = { id: sessionId, user: null, nsfwAccepted: false };
  sessions.set(sessionId, created);
  return created;
}

// ── Boards ─────────────────────────────────────────────

export async function getBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('slug');
  if (error) throw error;
  return data ?? [];
}

export async function getBoard(slug: string): Promise<Board | null> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ── Threads ────────────────────────────────────────────

export async function getThreadsForBoard(boardSlug: string) {
  const { data, error } = await supabase
    .from('threads')
    .select('id, title, nsfw, created_at')
    .eq('board_slug', boardSlug)
    .order('created_at', { ascending: false });
  if (error) throw error;

  // Get post counts
  const threadIds = (data ?? []).map((t) => t.id);
  const counts: Record<string, number> = {};

  if (threadIds.length > 0) {
    const { data: postCounts, error: pcErr } = await supabase
      .from('posts')
      .select('thread_id')
      .in('thread_id', threadIds);
    if (pcErr) throw pcErr;
    for (const p of postCounts ?? []) {
      counts[p.thread_id] = (counts[p.thread_id] ?? 0) + 1;
    }
  }

  return (data ?? []).map((t) => ({
    ...t,
    postCount: counts[t.id] ?? 0
  }));
}

export async function createThread(
  boardSlug: string,
  title: string,
  body: string,
  authorId: string,
  authorName: string,
  nsfw: boolean
) {
  const { data: thread, error: tErr } = await supabase
    .from('threads')
    .insert({ board_slug: boardSlug, title, nsfw })
    .select()
    .single();
  if (tErr) throw tErr;

  const { error: pErr } = await supabase
    .from('posts')
    .insert({
      thread_id: thread.id,
      author_id: authorId,
      author_name: authorName,
      body
    });
  if (pErr) throw pErr;

  return thread;
}

// ── Thread Details ─────────────────────────────────────

export async function getThread(threadId: string) {
  const { data: thread, error: tErr } = await supabase
    .from('threads')
    .select('*')
    .eq('id', threadId)
    .single();
  if (tErr) return null;

  const { data: posts, error: pErr } = await supabase
    .from('posts')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (pErr) throw pErr;

  return { ...thread, posts: posts ?? [] };
}

// ── Posts ───────────────────────────────────────────────

export async function createPost(
  threadId: string,
  authorId: string,
  authorName: string,
  body: string
) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      thread_id: threadId,
      author_id: authorId,
      author_name: authorName,
      body
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function hasPost(postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ── Media Drafts ───────────────────────────────────────

export async function createMediaDraft(draft: Omit<MediaDraft, 'created_at'>) {
  const { error } = await supabase.from('media_drafts').insert(draft);
  if (error) throw error;
}

export async function getMediaDraft(draftId: string): Promise<MediaDraft | null> {
  const { data, error } = await supabase
    .from('media_drafts')
    .select('*')
    .eq('draft_id', draftId)
    .single();
  if (error) return null;
  return data;
}

export async function commitMediaDraft(draftId: string) {
  const { error } = await supabase
    .from('media_drafts')
    .update({ committed: true })
    .eq('draft_id', draftId);
  if (error) throw error;
}

// ── Media Records ──────────────────────────────────────

export async function createMediaRecord(record: Omit<MediaRecord, 'created_at'>) {
  const { data, error } = await supabase
    .from('media_records')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Reports ────────────────────────────────────────────

export async function createReport(
  targetType: string,
  targetId: string,
  reason: string,
  reporterId: string
) {
  const { error } = await supabase
    .from('reports')
    .insert({ target_type: targetType, target_id: targetId, reason, reporter_id: reporterId });
  if (error) throw error;
}

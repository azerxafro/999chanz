import { ok, fail, requireNsfwAccepted } from '$lib/server/http';
import { boards, threads } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
  const board = boards.find((entry) => entry.slug === event.params.slug);
  if (!board) return fail('board not found', 404);

  if (board.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const boardThreads = threads
    .filter((thread) => thread.boardSlug === board.slug)
    .map((thread) => ({
      id: thread.id,
      title: thread.title,
      postCount: thread.posts.length,
      createdAt: thread.createdAt,
      nsfw: thread.nsfw
    }));

  return ok({ board, threads: boardThreads });
};

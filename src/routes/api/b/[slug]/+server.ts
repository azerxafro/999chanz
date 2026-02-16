import { ok, fail, requireNsfwAccepted } from '$lib/server/http';
import { getBoard, getThreadsForBoard } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const { params } = event;
  const board = await getBoard(params.slug);
  if (!board) return fail('board not found', 404);

  if (board.nsfw) {
    const denied = requireNsfwAccepted(event);
    if (denied) return denied;
  }

  const threads = await getThreadsForBoard(board.slug);
  return ok({ board, threads });
};

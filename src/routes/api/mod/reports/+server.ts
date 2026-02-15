import { ok, requireRole } from '$lib/server/http';
import { reports } from '$lib/server/state';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
  const user = requireRole(event, 'mod');
  if (user instanceof Response) return user;

  return ok({
    items: reports.filter((report) => report.status === 'open')
  });
};

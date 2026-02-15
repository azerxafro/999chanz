import { fail, ok, parseJson, requireRole } from '$lib/server/http';
import { reports } from '$lib/server/state';
import type { RequestHandler } from './$types';

type Payload = {
  resolution?: string;
};

export const POST: RequestHandler = async (event) => {
  const user = requireRole(event, 'mod');
  if (user instanceof Response) return user;

  const report = reports.find((entry) => entry.id === event.params.id);
  if (!report) return fail('report not found', 404);
  if (report.status === 'resolved') return fail('report already resolved', 409);

  const payload = (await parseJson<Payload>(event)) ?? {};

  report.status = 'resolved';
  report.resolution = payload.resolution ?? 'resolved';
  report.actedBy = user.id;
  report.actedAt = Date.now();

  return ok({ ok: true, reportId: report.id });
};

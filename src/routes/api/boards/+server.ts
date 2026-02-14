import { ok } from '$lib/server/http';
import { boards } from '$lib/server/state';

export const GET = () => ok(boards);

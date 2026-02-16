import { ok } from '$lib/server/http';
import { getBoards } from '$lib/server/state';

export const GET = async () => ok(await getBoards());

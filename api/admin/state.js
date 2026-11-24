import { route } from '../../lib/http.js';
import { adminState } from '../../lib/core.js';

export default route(async ({ config, store }) => ({ status: 200, body: await adminState({ store, config }) }), { admin: true });

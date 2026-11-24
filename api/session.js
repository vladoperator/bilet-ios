import { route } from '../lib/http.js';
import { validateToken } from '../lib/core.js';

export default route(async ({ body, config, store }) => ({
  status: 200,
  body: await validateToken({ store, config, token: body.token }),
}));

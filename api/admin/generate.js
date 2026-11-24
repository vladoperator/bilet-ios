import { route } from '../../lib/http.js';
import { generateInvites } from '../../lib/core.js';

export default route(async ({ body, config, store }) => ({
  status: 200,
  body: await generateInvites({ store, config, count: body.count }),
}), { admin: true });

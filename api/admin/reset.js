import { route } from '../../lib/http.js';
import { resetAll } from '../../lib/core.js';

export default route(async ({ body, store }) => ({
  status: 200,
  body: await resetAll({ store, deleteGenerated: body.deleteGenerated === true }),
}), { admin: true });

import { route } from '../../lib/http.js';
import { revokeDevice } from '../../lib/core.js';

export default route(({ body, store }) => revokeDevice({ store, code: body.code }), { admin: true });

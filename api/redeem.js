import { route } from '../lib/http.js';
import { redeem } from '../lib/core.js';

export default route(({ body, config, store, ip }) =>
  redeem({ store, config, code: body.code, device: body.device, ip }));

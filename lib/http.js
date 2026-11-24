import { loadConfig, isAdminToken } from './core.js';
import { blobStore } from './store.js';

let defaultStore;
export const getStore = () => (defaultStore ||= blobStore());
// Lets tests swap in the in-memory store.
export const setStore = (store) => { defaultStore = store; };

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

// Wraps a handler: POST only, JSON in/out, no caching, config + error handling in one place.
// opts.admin = true requires a valid admin Bearer token.
export function route(handler, { admin = false, store = null, env = process.env } = {}) {
  return async (req, res) => {
    const send = (status, body) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(body));
    };
    try {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { error: 'Method not allowed' }); }
      const config = loadConfig(env);
      if (!config) return send(500, { error: 'Server is not configured.' });
      const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      if (admin && !isAdminToken(config, bearer)) return send(401, { error: 'Admin access required.' });
      const body = await readBody(req);
      const result = await handler({ req, body, bearer, config, store: store || getStore(), ip: clientIp(req) });
      return send(result.status || 200, result.body);
    } catch (e) {
      console.error('API error', e);
      return send(500, { error: 'Server error. Please try again.' });
    }
  };
}

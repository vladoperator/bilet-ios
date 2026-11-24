// Backend rules for the private-access gate. Pure functions over a store, so they are
// testable without Vercel. Secrets (admin code, seed codes) only ever come from env.
//
// Data (private blobs):
//   invites/<CODE>    codes generated from the admin panel
//   redeemed/<CODE>   who redeemed a code: device, ip, time, hash of their session secret
//   attempts/<hash>   failed-attempt counter per IP (brute-force protection)
//
// A user session is "u.<CODE>.<secret>": valid only while redeemed/<CODE> exists AND holds the
// hash of that secret. Deleting redeemed/* (Reset) therefore signs every user device out at once.
// An admin session is a signed, expiring token and never depends on stored data.
import crypto from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ADMIN_TTL_MS = 30 * 24 * 3600 * 1000;
const MAX_FAILS = 10;
const FAIL_WINDOW_MS = 15 * 60 * 1000;

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const hmac = (key, s) => crypto.createHmac('sha256', key).update(s).digest('hex');
const safeEqual = (a, b) =>
  crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(),
                         crypto.createHash('sha256').update(String(b)).digest());

export function loadConfig(env = process.env) {
  const adminCode = (env.ADMIN_CODE || '').trim().toUpperCase();
  if (!adminCode) return null;
  const initialCodes = (env.INITIAL_CODES || '').split(/[\s,]+/).map((c) => c.trim().toUpperCase()).filter(Boolean);
  // Signing key never has to be configured: it is derived from two server-only secrets.
  const signingKey = env.SESSION_SECRET || sha256('bilet-session-v1|' + (env.BLOB_READ_WRITE_TOKEN || '') + '|' + adminCode);
  return { adminCode, initialCodes, signingKey };
}

const makeAdminToken = (config, now) => {
  const exp = now + ADMIN_TTL_MS;
  return `a.${exp}.${hmac(config.signingKey, 'admin.' + exp)}`;
};
const verifyAdminToken = (config, token, now) => {
  const [kind, exp, sig] = String(token).split('.');
  if (kind !== 'a' || !/^\d+$/.test(exp || '') || !sig) return false;
  if (Number(exp) < now) return false;
  return safeEqual(sig, hmac(config.signingKey, 'admin.' + exp));
};

const fail = (status, error) => ({ status, body: { error } });

// ---- brute-force protection (per IP, failures only) ----
async function isBlocked(store, ip, now) {
  const rec = await store.read('attempts/' + sha256(ip));
  return !!(rec && now - rec.windowStart < FAIL_WINDOW_MS && rec.count >= MAX_FAILS);
}
async function recordFailure(store, ip, now) {
  const path = 'attempts/' + sha256(ip);
  const rec = await store.read(path);
  const fresh = !rec || now - rec.windowStart >= FAIL_WINDOW_MS;
  await store.write(path, { windowStart: fresh ? now : rec.windowStart, count: fresh ? 1 : rec.count + 1 });
}

export async function redeem({ store, config, code, device, ip, now = Date.now() }) {
  const input = String(code || '').trim().toUpperCase();
  if (!input || input.length > 64) return fail(400, 'Please enter a valid 10-character code.');
  if (await isBlocked(store, ip, now)) return fail(429, 'Too many wrong attempts. Please try again in 15 minutes.');

  if (safeEqual(input, config.adminCode)) {
    return { status: 200, body: { role: 'admin', token: makeAdminToken(config, now) } };
  }

  if (!/^[A-Z0-9]{10}$/.test(input)) return fail(400, 'Please enter a valid 10-character code.');

  const valid = config.initialCodes.includes(input) || !!(await store.read('invites/' + input));
  if (!valid) {
    await recordFailure(store, ip, now);
    return fail(403, 'Invalid invite code. Access denied.');
  }

  const secret = crypto.randomBytes(24).toString('base64url');
  const created = await store.create('redeemed/' + input, {
    code: input,
    tokenHash: sha256(secret),
    device: String(device || 'Unknown Device').slice(0, 120),
    ip: String(ip || 'Unknown IP').slice(0, 64),
    redeemedAt: new Date(now).toISOString(),
  });
  // create() is atomic: if two devices race for one code, exactly one gets here.
  if (!created) return fail(409, 'This invite code has already been redeemed.');
  return { status: 200, body: { role: 'user', token: `u.${input}.${secret}`, code: input } };
}

export async function validateToken({ store, config, token, now = Date.now() }) {
  const t = String(token || '');
  if (t.startsWith('a.')) return verifyAdminToken(config, t, now) ? { valid: true, role: 'admin' } : { valid: false };
  const [kind, code, secret] = t.split('.');
  if (kind !== 'u' || !/^[A-Z0-9]{10}$/.test(code || '') || !secret) return { valid: false };
  const rec = await store.read('redeemed/' + code);
  return rec && safeEqual(sha256(secret), rec.tokenHash) ? { valid: true, role: 'user', code } : { valid: false };
}

export const isAdminToken = (config, token, now = Date.now()) => verifyAdminToken(config, token, now);

async function readAll(store, prefix) {
  const items = await store.list(prefix);
  const out = [];
  for (let i = 0; i < items.length; i += 20) {
    out.push(...(await Promise.all(items.slice(i, i + 20).map(async (it) => ({ it, rec: await store.read(it.path) })))));
  }
  return out;
}

export async function adminState({ store, config }) {
  const redeemed = (await readAll(store, 'redeemed/')).filter((x) => x.rec).map((x) => x.rec);
  const redeemedSet = new Set(redeemed.map((r) => r.code));
  const generated = (await store.list('invites/'))
    .sort((a, b) => b.uploadedAt - a.uploadedAt)
    .map((i) => i.path.slice('invites/'.length));
  const invites = [...config.initialCodes, ...generated].map((code) => ({
    code, status: redeemedSet.has(code) ? 'redeemed' : 'available', generated: generated.includes(code),
  }));
  const redemptions = redeemed
    .map((r) => ({ code: r.code, role: 'user', device: r.device, ip: r.ip, redeemedAt: r.redeemedAt }))
    .sort((a, b) => String(b.redeemedAt).localeCompare(String(a.redeemedAt)));
  return { invites, redemptions };
}

export async function generateInvites({ store, config, count }) {
  const num = Math.max(1, Math.min(100, parseInt(count, 10) || 5));
  const codes = [];
  while (codes.length < num) {
    const bytes = crypto.randomBytes(10);
    let code = '';
    for (let i = 0; i < 10; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
    if (config.initialCodes.includes(code) || codes.includes(code)) continue;
    if (await store.create('invites/' + code, { createdAt: new Date().toISOString() })) codes.push(code);
  }
  return { codes };
}

// Every code becomes unused and every connected user device is signed out. Admin is untouched.
export async function resetAll({ store, deleteGenerated }) {
  const redeemed = await store.list('redeemed/');
  await store.remove(redeemed.map((r) => r.path));
  let removedGenerated = 0;
  if (deleteGenerated) {
    const gen = await store.list('invites/');
    await store.remove(gen.map((r) => r.path));
    removedGenerated = gen.length;
  }
  return { removedDevices: redeemed.length, removedGenerated };
}

// Removes one device: its redemption disappears, so its token stops working and the code is free again.
export async function revokeDevice({ store, code }) {
  const c = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(c)) return { status: 400, body: { error: 'Invalid code.' } };
  await store.remove(['redeemed/' + c]);
  return { status: 200, body: { ok: true } };
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../lib/store.js';
import { loadConfig, redeem, validateToken, adminState, generateInvites, resetAll, revokeDevice, isAdminToken } from '../lib/core.js';

const env = { ADMIN_CODE: 'admin77777', INITIAL_CODES: 'AAAAAAAAAA, BBBBBBBBBB ,CCCCCCCCCC', BLOB_READ_WRITE_TOKEN: 't' };
const setup = () => ({ store: memoryStore(), config: loadConfig(env) });
const user = (ctx, code, ip = '1.1.1.1') => redeem({ ...ctx, code, device: 'iPhone', ip });

test('config needs ADMIN_CODE and parses seed codes', () => {
  assert.equal(loadConfig({}), null);
  assert.deepEqual(loadConfig(env).initialCodes, ['AAAAAAAAAA', 'BBBBBBBBBB', 'CCCCCCCCCC']);
});

test('a code works once, on one device only', async () => {
  const ctx = setup();
  const a = await user(ctx, 'aaaaaaaaaa');
  assert.equal(a.status, 200);
  assert.equal(a.body.role, 'user');
  const b = await user(ctx, 'AAAAAAAAAA', '2.2.2.2');
  assert.equal(b.status, 409);
  assert.match(b.body.error, /already been redeemed/);
});

test('racing devices: exactly one wins', async () => {
  const ctx = setup();
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => user(ctx, 'BBBBBBBBBB', `9.9.9.${i}`)));
  assert.equal(results.filter((r) => r.status === 200).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 7);
});

test('unknown / malformed codes are rejected', async () => {
  const ctx = setup();
  assert.equal((await user(ctx, 'ZZZZZZZZZZ')).status, 403);
  assert.equal((await user(ctx, 'short')).status, 400);
  assert.equal((await user(ctx, '')).status, 400);
});

test('user token is valid until reset, then rejected', async () => {
  const ctx = setup();
  const { body } = await user(ctx, 'AAAAAAAAAA');
  assert.deepEqual(await validateToken({ ...ctx, token: body.token }), { valid: true, role: 'user', code: 'AAAAAAAAAA' });
  const res = await resetAll({ store: ctx.store, deleteGenerated: false });
  assert.equal(res.removedDevices, 1);
  assert.deepEqual(await validateToken({ ...ctx, token: body.token }), { valid: false });
});

test('a reset code can be redeemed by a new device without reviving the old token', async () => {
  const ctx = setup();
  const old = await user(ctx, 'AAAAAAAAAA');
  await resetAll({ store: ctx.store });
  const fresh = await user(ctx, 'AAAAAAAAAA', '3.3.3.3');
  assert.equal(fresh.status, 200);
  assert.equal((await validateToken({ ...ctx, token: old.body.token })).valid, false);
  assert.equal((await validateToken({ ...ctx, token: fresh.body.token })).valid, true);
});

test('forged / tampered tokens are rejected', async () => {
  const ctx = setup();
  const { body } = await user(ctx, 'AAAAAAAAAA');
  for (const token of ['', 'u.AAAAAAAAAA.wrong', 'u.BBBBBBBBBB.' + body.token.split('.')[2], 'a.99999999999999.deadbeef', 'x.y.z', undefined]) {
    assert.equal((await validateToken({ ...ctx, token })).valid, false, String(token));
  }
});

test('admin: works any number of times, survives reset, token is signed', async () => {
  const ctx = setup();
  const a1 = await redeem({ ...ctx, code: 'ADMIN77777', device: 'Mac', ip: '4.4.4.4' });
  const a2 = await redeem({ ...ctx, code: 'admin77777', device: 'iPhone', ip: '5.5.5.5' });
  assert.equal(a1.body.role, 'admin');
  assert.equal(a2.body.role, 'admin');
  assert.ok(isAdminToken(ctx.config, a1.body.token));
  await user(ctx, 'AAAAAAAAAA');
  await resetAll({ store: ctx.store, deleteGenerated: true });
  assert.equal((await validateToken({ ...ctx, token: a1.body.token })).role, 'admin');
  assert.equal(isAdminToken(ctx.config, a1.body.token.replace(/.$/, 'x')), false);
  assert.equal(isAdminToken(ctx.config, a1.body.token, Date.now() + 31 * 24 * 3600 * 1000), false, 'expires');
  assert.equal(isAdminToken(loadConfig({ ...env, ADMIN_CODE: 'OTHER' }), a1.body.token), false, 'new admin code revokes old tokens');
});

test('generate, list, reset (keep vs delete generated)', async () => {
  const ctx = setup();
  const { codes } = await generateInvites({ ...ctx, count: 5 });
  assert.equal(codes.length, 5);
  assert.ok(codes.every((c) => /^[A-HJ-NP-Z2-9]{10}$/.test(c)));
  assert.equal((await adminState(ctx)).invites.length, 8);
  assert.equal((await user(ctx, codes[0])).status, 200, 'generated code is redeemable');
  await user(ctx, 'AAAAAAAAAA');
  let st = await adminState(ctx);
  assert.equal(st.redemptions.length, 2);
  assert.equal(st.invites.filter((i) => i.status === 'redeemed').length, 2);
  await resetAll({ store: ctx.store, deleteGenerated: false });
  st = await adminState(ctx);
  assert.equal(st.redemptions.length, 0);
  assert.equal(st.invites.length, 8, 'generated codes kept');
  assert.ok(st.invites.every((i) => i.status === 'available'));
  const r = await resetAll({ store: ctx.store, deleteGenerated: true });
  assert.equal(r.removedGenerated, 5);
  assert.equal((await adminState(ctx)).invites.length, 3);
  assert.equal((await user(ctx, codes[1])).status, 403, 'deleted generated code no longer valid');
});

test('removing one device signs out only that device', async () => {
  const ctx = setup();
  const a = await user(ctx, 'AAAAAAAAAA');
  const b = await user(ctx, 'BBBBBBBBBB');
  assert.equal((await revokeDevice({ store: ctx.store, code: 'AAAAAAAAAA' })).status, 200);
  assert.equal((await validateToken({ ...ctx, token: a.body.token })).valid, false);
  assert.equal((await validateToken({ ...ctx, token: b.body.token })).valid, true);
  assert.equal((await revokeDevice({ store: ctx.store, code: 'bad' })).status, 400);
});

test('brute force: an IP is blocked after 10 wrong codes, others are not', async () => {
  const ctx = setup();
  for (let i = 0; i < 10; i++) assert.equal((await user(ctx, 'ZZZZZZZZZ' + i, '6.6.6.6')).status, 403);
  assert.equal((await user(ctx, 'AAAAAAAAAA', '6.6.6.6')).status, 429, 'even a right code is refused while blocked');
  assert.equal((await redeem({ ...ctx, code: 'ADMIN77777', device: 'x', ip: '6.6.6.6' })).status, 429, 'admin code too');
  assert.equal((await user(ctx, 'AAAAAAAAAA', '7.7.7.7')).status, 200, 'other IP unaffected');
  const later = Date.now() + 16 * 60 * 1000;
  assert.equal((await redeem({ ...ctx, code: 'BBBBBBBBBB', device: 'x', ip: '6.6.6.6', now: later })).status, 200, 'unblocked after window');
});

test('secrets never appear in stored data or admin state', async () => {
  const ctx = setup();
  const { body } = await user(ctx, 'AAAAAAAAAA');
  const secret = body.token.split('.')[2];
  const dump = JSON.stringify([...ctx.store.data.values()]);
  assert.ok(!dump.includes(secret), 'only a hash is stored');
  assert.ok(!JSON.stringify(await adminState(ctx)).includes('tokenHash'));
});

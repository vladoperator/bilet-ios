// Storage layer. Everything the backend persists goes through this tiny interface:
//   create(path, obj) -> true if written, false if the path already existed (ATOMIC)
//   read(path)        -> object | null
//   write(path, obj)  -> overwrite
//   list(prefix)      -> [{ path, uploadedAt }]
//   remove(paths)     -> delete many
// Production uses private Vercel Blobs; tests use the in-memory twin below.

export function blobStore() {
  // Imported lazily so tests never need the package or a token.
  let sdk;
  const load = async () => (sdk ||= await import('@vercel/blob'));
  const priv = { access: 'private' };

  const exists = async (path) => {
    const { head } = await load();
    try { await head(path); return true; } catch (e) {
      if (e && (e.name === 'BlobNotFoundError' || /not.?found/i.test(e.message || ''))) return false;
      throw e;
    }
  };

  return {
    async create(path, obj) {
      const { put } = await load();
      try {
        await put(path, JSON.stringify(obj), {
          ...priv, contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false,
        });
        return true;
      } catch (e) {
        // Put refuses to overwrite: that is the single-use guarantee. Anything else is a real error.
        if (await exists(path)) return false;
        throw e;
      }
    },
    async read(path) {
      const { get } = await load();
      let r;
      try { r = await get(path, { ...priv, useCache: false }); } catch (e) {
        if (e && (e.name === 'BlobNotFoundError' || /not.?found/i.test(e.message || ''))) return null;
        throw e;
      }
      if (!r || r.statusCode !== 200) return null;
      return JSON.parse(await new Response(r.stream).text());
    },
    async write(path, obj) {
      const { put } = await load();
      await put(path, JSON.stringify(obj), {
        ...priv, contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
      });
    },
    async list(prefix) {
      const { list } = await load();
      const out = [];
      let cursor;
      do {
        const page = await list({ prefix, cursor, limit: 1000 });
        page.blobs.forEach((b) => out.push({ path: b.pathname, uploadedAt: new Date(b.uploadedAt).getTime() }));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return out;
    },
    async remove(paths) {
      const { del } = await load();
      for (let i = 0; i < paths.length; i += 100) await del(paths.slice(i, i + 100));
    },
  };
}

export function memoryStore() {
  const data = new Map();
  return {
    data,
    async create(path, obj) {
      if (data.has(path)) return false;
      data.set(path, { json: JSON.stringify(obj), uploadedAt: Date.now() });
      return true;
    },
    async read(path) {
      const e = data.get(path);
      return e ? JSON.parse(e.json) : null;
    },
    async write(path, obj) { data.set(path, { json: JSON.stringify(obj), uploadedAt: Date.now() }); },
    async list(prefix) {
      return [...data.entries()].filter(([p]) => p.startsWith(prefix)).map(([p, e]) => ({ path: p, uploadedAt: e.uploadedAt }));
    },
    async remove(paths) { paths.forEach((p) => data.delete(p)); },
  };
}

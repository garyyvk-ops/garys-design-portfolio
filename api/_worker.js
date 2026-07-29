import worker from '../dist/server/index.js';

function readEnv(name) {
  return typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string'
    ? process.env[name]
    : '';
}

function getEnv() {
  return {
    SUPABASE_URL: readEnv('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_STORAGE_BUCKET: readEnv('SUPABASE_STORAGE_BUCKET'),
    CMS_SESSION_SECRET: readEnv('CMS_SESSION_SECRET'),
    CMS_HOST_PASSWORD: readEnv('CMS_HOST_PASSWORD')
  };
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return req.body;
    return JSON.stringify(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function buildHeaders(source) {
  const headers = new Headers();
  Object.entries(source || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  });
  return headers;
}

export async function handleRequest(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `${protocol}://${host}`);
  const method = (req.method || 'GET').toUpperCase();
  const headers = buildHeaders(req.headers);
  const init = { method, headers };

  if (method !== 'GET' && method !== 'HEAD') {
    const body = await readBody(req);
    if (body !== undefined) init.body = body;
  }

  return worker.fetch(new Request(url.toString(), init), getEnv());
}

export default async function handler(req, res) {
  const response = await handleRequest(req);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      res.setHeader('Set-Cookie', value);
    } else {
      res.setHeader(key, value);
    }
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}

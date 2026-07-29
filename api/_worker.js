import worker from '../dist/server/index.js';

export const config = {
  runtime: 'edge'
};

function readEnv(name) {
  const env = globalThis.process && globalThis.process.env ? globalThis.process.env : null;
  return env && typeof env[name] === 'string' ? env[name] : '';
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

export function handle(request) {
  return worker.fetch(request, getEnv());
}

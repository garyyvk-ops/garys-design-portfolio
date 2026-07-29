import worker from '../dist/server/index.js';

export const config = {
  runtime: 'edge'
};

function getEnv() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || '',
    CMS_SESSION_SECRET: process.env.CMS_SESSION_SECRET || '',
    CMS_HOST_PASSWORD: process.env.CMS_HOST_PASSWORD || ''
  };
}

export function handle(request) {
  return worker.fetch(request, getEnv());
}

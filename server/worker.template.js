const STATIC_ROUTES = __STATIC_ROUTES__;

const encoder = new TextEncoder();
const htmlCache = new Map();

const defaultSite = {
  siteTitle: "Gary's Design",
  introHeading: 'Instructional design work, written and shown.',
  introCopy: 'A simple publishing home for learning articles, process images, demo videos, and complete case-study posts. Built so each new piece can stand alone as evidence of design thinking, content craft, and learner-centered execution.',
  profileName: 'Gary',
  profileRole: 'Instructional Designer',
  profileBio: 'Use this space for your specialty, your point of view, and the kinds of learning problems you solve.',
  heroCoverSrc: '',
  profileImageSrc: '',
  featuredEyebrow: 'Featured case study',
  featuredTitle: 'From course notes to learner pathway.',
  featuredCopy: 'Lead with a strong piece that combines article writing, screenshots, and a short walkthrough video. The layout keeps the editorial split while making the content clearly instructional-design focused.',
  featuredMedia: 'Featured article + gallery + video',
  featuredImageSrc: '',
  contactHeading: 'Invite the work into a conversation.',
  contactCopy: 'Use this footer for your email, resume, LinkedIn, and a short note about the kinds of learning design projects you want to take on next.',
  contactEmail: 'hello@example.com',
  linkedinLabel: 'LinkedIn profile URL',
  linkedinUrl: '',
  resumeLabel: 'Resume PDF link',
  resumeUrl: ''
};

const seedPosts = [
  {
    id: 'seed-1',
    title: 'Designing a microlearning series for busy managers',
    kind: 'Article',
    audience: 'Team leads',
    date: 'Draft post',
    summary: 'A written breakdown of how short lessons, spaced prompts, and manager reflection questions can turn a policy topic into a practical coaching routine.',
    media: 'Article outline and lesson structure',
    attachments: []
  },
  {
    id: 'seed-2',
    title: 'Storyboard frames for a customer-service simulation',
    kind: 'Pictures',
    audience: 'Frontline support',
    date: 'Draft post',
    summary: 'A visual process post showing scenario beats, feedback moments, and interface states for a branching practice activity.',
    media: 'Storyboard screenshots',
    attachments: []
  },
  {
    id: 'seed-3',
    title: 'Video walkthrough: from learning objective to prototype',
    kind: 'Video',
    audience: 'Portfolio reviewers',
    date: 'Draft post',
    summary: 'A short narrated walkthrough slot for explaining the decisions behind an instructional prototype without making the viewer read the whole case study first.',
    media: 'Video embed placeholder',
    attachments: []
  },
  {
    id: 'seed-4',
    title: 'Complete case study: blended onboarding path',
    kind: 'Mixed',
    audience: 'Hiring managers',
    date: 'Draft post',
    summary: 'A combined article, image gallery, and video reflection that documents the problem, design constraints, sample deliverables, and what changed after review.',
    media: 'Article + images + video',
    attachments: []
  }
];

function decodeBase64(base64) {
  if (!htmlCache.has(base64)) {
    htmlCache.set(base64, new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0))));
  }
  return htmlCache.get(base64);
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }, headers)
  });
}

function text(message, status = 200, headers = {}) {
  return new Response(message, {
    status,
    headers: Object.assign({
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store'
    }, headers)
  });
}

function normalizeAttachments(attachments) {
  return Array.isArray(attachments)
    ? attachments.filter(item => item && item.src && item.kind && item.name)
    : [];
}

function normalizePost(post) {
  return {
    id: post.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: post.title || '',
    kind: post.kind || 'Article',
    audience: post.audience || '',
    date: post.date || 'Draft post',
    summary: post.summary || '',
    media: post.media || '',
    attachments: normalizeAttachments(post.attachments)
  };
}

function getConfig(env) {
  return {
    supabaseUrl: env.SUPABASE_URL || '',
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    bucket: env.SUPABASE_STORAGE_BUCKET || 'portfolio-assets',
    hostPassword: env.CMS_HOST_PASSWORD || '',
    sessionSecret: env.CMS_SESSION_SECRET || ''
  };
}

function hasPersistence(config) {
  return Boolean(config.supabaseUrl && config.serviceRoleKey);
}

function hasAuth(config) {
  return Boolean(config.sessionSecret);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest)).map(item => item.toString(16).padStart(2, '0')).join('');
}

function cookieOptions(maxAge = 60 * 60 * 24 * 14) {
  return `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function parseCookies(request) {
  const header = request.headers.get('cookie') || '';
  return header.split(/;\s*/).filter(Boolean).reduce((acc, entry) => {
    const index = entry.indexOf('=');
    if (index === -1) return acc;
    acc[entry.slice(0, index)] = decodeURIComponent(entry.slice(index + 1));
    return acc;
  }, {});
}

function base64UrlEncode(bytes) {
  let text = '';
  for (const value of bytes) text += String.fromCharCode(value);
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function signValue(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createSessionToken(secret) {
  const payload = base64UrlEncode(encoder.encode(JSON.stringify({
    exp: Date.now() + (14 * 24 * 60 * 60 * 1000)
  })));
  const signature = await signValue(payload, secret);
  return `${payload}.${signature}`;
}

async function verifySessionToken(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = await signValue(payload, secret);
  if (expected !== signature) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    return data.exp && data.exp > Date.now();
  } catch (_) {
    return false;
  }
}

async function requireAuth(request, env) {
  const config = getConfig(env);
  if (!hasAuth(config)) {
    throw new Error('CMS auth is not configured yet. Add CMS_SESSION_SECRET.');
  }
  const cookies = parseCookies(request);
  const ok = await verifySessionToken(cookies.gd_host_session, config.sessionSecret);
  if (!ok) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  return config;
}

async function supabaseFetch(env, path, init = {}) {
  const config = getConfig(env);
  const headers = new Headers(init.headers || {});
  headers.set('apikey', config.serviceRoleKey);
  headers.set('authorization', `Bearer ${config.serviceRoleKey}`);
  const response = await fetch(`${config.supabaseUrl}${path}`, Object.assign({}, init, { headers }));
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'Supabase request failed.');
  }
  return response;
}

async function fetchContent(env) {
  const config = getConfig(env);
  if (!hasPersistence(config)) {
    return {
      site: Object.assign({}, defaultSite),
      posts: seedPosts.map(normalizePost),
      configured: false
    };
  }

  const [siteResponse, postsResponse] = await Promise.all([
    supabaseFetch(env, '/rest/v1/site_content?slug=eq.main&select=*'),
    supabaseFetch(env, '/rest/v1/posts?select=*&order=position.desc')
  ]);

  const siteRows = await siteResponse.json();
  const postRows = await postsResponse.json();
  const site = siteRows.length
    ? Object.assign({}, defaultSite, siteRows[0].payload || {})
    : Object.assign({}, defaultSite);
  const posts = postRows.length
    ? postRows.map(row => normalizePost({
        id: row.id,
        title: row.title,
        kind: row.kind,
        audience: row.audience,
        date: row.date_label,
        summary: row.summary,
        media: row.media_note,
        attachments: row.attachments || []
      }))
    : seedPosts.map(normalizePost);

  return { site, posts, configured: true };
}

async function uploadFile(env, file, folder) {
  const config = getConfig(env);
  const extension = String(file.name || 'asset').split('.').pop().toLowerCase();
  const safeExt = extension && extension !== String(file.name || '') ? extension : (file.type.startsWith('video/') ? 'mp4' : 'jpg');
  const path = `${folder}/${crypto.randomUUID()}.${safeExt}`;
  await supabaseFetch(env, `/storage/v1/object/${config.bucket}/${path}`, {
    method: 'POST',
    headers: {
      'content-type': file.type || 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: await file.arrayBuffer()
  });
  return `${config.supabaseUrl}/storage/v1/object/public/${config.bucket}/${path}`;
}

async function resolveSiteAsset(env, formData, fieldName, previousValue) {
  const clearKey = `clear${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
  if (String(formData.get(clearKey) || '') === '1') return '';
  const url = String(formData.get(`${fieldName}Url`) || '').trim();
  const file = formData.get(`${fieldName}File`);
  if (file && typeof file === 'object' && file.size > 0) {
    return uploadFile(env, file, `site/${fieldName}`);
  }
  if (url) return url;
  return previousValue || '';
}

async function saveSite(env, request) {
  const config = await requireAuth(request, env);
  if (!hasPersistence(config)) {
    throw new Error('CMS storage is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const existing = await fetchContent(env);
  const formData = await request.formData();
  const payload = Object.assign({}, existing.site, {
    siteTitle: String(formData.get('siteTitle') || '').trim() || defaultSite.siteTitle,
    profileName: String(formData.get('profileName') || '').trim() || defaultSite.profileName,
    introHeading: String(formData.get('introHeading') || '').trim() || defaultSite.introHeading,
    introCopy: String(formData.get('introCopy') || '').trim() || defaultSite.introCopy,
    profileRole: String(formData.get('profileRole') || '').trim() || defaultSite.profileRole,
    profileBio: String(formData.get('profileBio') || '').trim() || defaultSite.profileBio,
    featuredEyebrow: String(formData.get('featuredEyebrow') || '').trim() || defaultSite.featuredEyebrow,
    featuredTitle: String(formData.get('featuredTitle') || '').trim() || defaultSite.featuredTitle,
    featuredCopy: String(formData.get('featuredCopy') || '').trim() || defaultSite.featuredCopy,
    featuredMedia: String(formData.get('featuredMedia') || '').trim() || defaultSite.featuredMedia,
    contactHeading: String(formData.get('contactHeading') || '').trim() || defaultSite.contactHeading,
    contactCopy: String(formData.get('contactCopy') || '').trim() || defaultSite.contactCopy,
    contactEmail: String(formData.get('contactEmail') || '').trim() || defaultSite.contactEmail,
    linkedinLabel: String(formData.get('linkedinLabel') || '').trim() || defaultSite.linkedinLabel,
    linkedinUrl: String(formData.get('linkedinUrl') || '').trim(),
    resumeLabel: String(formData.get('resumeLabel') || '').trim() || defaultSite.resumeLabel,
    resumeUrl: String(formData.get('resumeUrl') || '').trim()
  });

  payload.heroCoverSrc = await resolveSiteAsset(env, formData, 'heroCover', existing.site.heroCoverSrc);
  payload.profileImageSrc = await resolveSiteAsset(env, formData, 'profileImage', existing.site.profileImageSrc);
  payload.featuredImageSrc = await resolveSiteAsset(env, formData, 'featuredImage', existing.site.featuredImageSrc);

  const newPasscode = String(formData.get('newPasscode') || '').trim();
  if (newPasscode && newPasscode.length < 4) {
    throw new Error('Use at least 4 characters for the studio passcode.');
  }

  await supabaseFetch(env, '/rest/v1/site_content?on_conflict=slug', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify([{
      slug: 'main',
      payload
    }])
  });

  if (newPasscode) {
    if (!config.sessionSecret) {
      throw new Error('CMS_SESSION_SECRET is required before rotating the host passcode.');
    }
    payload.hostPasscodeHash = await sha256Hex(newPasscode);
  }

  return payload;
}

async function extractAttachments(env, formData, existingAttachments) {
  const files = formData.getAll('files').filter(file => file && typeof file === 'object' && file.size > 0);
  if (files.length) {
    const uploads = [];
    for (const file of files) {
      const src = await uploadFile(env, file, 'posts');
      uploads.push({
        name: file.name,
        kind: (file.type || '').startsWith('video/') ? 'video' : 'image',
        size: file.size,
        src
      });
    }
    return uploads;
  }
  if (String(formData.get('removeAttachments') || '') === '1') {
    return [];
  }
  return normalizeAttachments(existingAttachments);
}

async function createOrUpdatePost(env, request, postId) {
  const config = await requireAuth(request, env);
  if (!hasPersistence(config)) {
    throw new Error('CMS storage is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const formData = await request.formData();
  const title = String(formData.get('title') || '').trim();
  const summary = String(formData.get('summary') || '').trim();
  if (!title) throw new Error('Add a title before saving the post.');
  if (!summary) throw new Error('Add a summary before saving the post.');

  const existing = postId
    ? await supabaseFetch(env, `/rest/v1/posts?id=eq.${encodeURIComponent(postId)}&select=*`).then(response => response.json()).then(rows => rows[0] || null)
    : null;

  const attachments = await extractAttachments(env, formData, existing ? existing.attachments : []);
  const payload = {
    id: postId || crypto.randomUUID(),
    title,
    kind: String(formData.get('kind') || 'Article'),
    audience: String(formData.get('audience') || '').trim(),
    date_label: existing ? `Updated ${new Date().toLocaleDateString('en-US')}` : 'New post',
    summary,
    media_note: String(formData.get('media') || '').trim(),
    attachments,
    position: existing ? existing.position : Date.now()
  };

  await supabaseFetch(env, '/rest/v1/posts?on_conflict=id', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify([payload])
  });

  return normalizePost({
    id: payload.id,
    title: payload.title,
    kind: payload.kind,
    audience: payload.audience,
    date: payload.date_label,
    summary: payload.summary,
    media: payload.media_note,
    attachments: payload.attachments
  });
}

async function deletePost(env, request, postId) {
  const config = await requireAuth(request, env);
  if (!hasPersistence(config)) {
    throw new Error('CMS storage is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  await supabaseFetch(env, `/rest/v1/posts?id=eq.${encodeURIComponent(postId)}`, {
    method: 'DELETE'
  });
}

async function handleApi(request, env, url) {
  try {
    if (request.method === 'GET' && url.pathname === '/api/content') {
      return json(await fetchContent(env));
    }

    if (request.method === 'GET' && url.pathname === '/api/session') {
      const config = getConfig(env);
      const cookies = parseCookies(request);
      const authenticated = hasAuth(config)
        ? await verifySessionToken(cookies.gd_host_session, config.sessionSecret)
        : false;
      return json({ authenticated });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const config = getConfig(env);
      if (!hasAuth(config)) {
        return json({ error: 'CMS auth is not configured yet. Add CMS_SESSION_SECRET.' }, 503);
      }
      const body = await request.json();
      const passcode = String(body.passcode || '').trim();
      const content = await fetchContent(env);
      const storedHash = content.site.hostPasscodeHash || '';
      const attemptedHash = passcode ? await sha256Hex(passcode) : '';
      const isBootstrapMatch = Boolean(config.hostPassword && passcode === config.hostPassword);
      const isStoredMatch = Boolean(storedHash && attemptedHash === storedHash);
      if (!passcode || (!isBootstrapMatch && !isStoredMatch)) {
        return json({ error: 'That passcode is not correct.' }, 401);
      }
      const token = await createSessionToken(config.sessionSecret);
      return json({ authenticated: true }, 200, {
        'set-cookie': `gd_host_session=${token}; ${cookieOptions()}`
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      return json({ authenticated: false }, 200, {
        'set-cookie': `gd_host_session=; ${cookieOptions(0)}`
      });
    }

    if (request.method === 'PUT' && url.pathname === '/api/site') {
      const site = await saveSite(env, request);
      return json({ site });
    }

    if (request.method === 'POST' && url.pathname === '/api/posts') {
      const post = await createOrUpdatePost(env, request, '');
      return json({ post });
    }

    const postMatch = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (postMatch && request.method === 'PUT') {
      const post = await createOrUpdatePost(env, request, decodeURIComponent(postMatch[1]));
      return json({ post });
    }

    if (postMatch && request.method === 'DELETE') {
      await deletePost(env, request, decodeURIComponent(postMatch[1]));
      return json({ ok: true });
    }
  } catch (error) {
    const status = error && error.status ? error.status : 400;
    return json({ error: error.message || 'Request failed.' }, status);
  }

  return null;
}

function serveStatic(pathname) {
  const route = STATIC_ROUTES[pathname];
  if (!route) return null;
  return new Response(decodeBase64(route.body), {
    headers: {
      'content-type': route.contentType,
      'cache-control': pathname.startsWith('/assets/') ? 'public, max-age=60' : 'no-store'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return text('ok');
    }

    if (url.pathname.startsWith('/api/')) {
      return await handleApi(request, env, url) || text('Not found', 404);
    }

    const route = serveStatic(url.pathname);
    if (route) return route;

    return text('Not found', 404);
  }
};

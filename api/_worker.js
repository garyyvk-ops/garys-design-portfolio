const encoder = new TextEncoder();

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
  featuredInlineAttachments: [],
  featuredMedia: 'Featured article + gallery + video',
  featuredImageSrc: '',
  contactHeading: 'Invite the work into a conversation.',
  contactCopy: 'Use this footer for your email, LinkedIn, and a short note about the kinds of learning design projects you want to take on next.',
  contactEmail: 'hello@example.com',
  linkedinLabel: 'LinkedIn profile URL',
  linkedinUrl: '',
  resumeLabel: '',
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

const seedPostIds = new Set(seedPosts.map(post => post.id));
const seedPostTitles = new Set(seedPosts.map(post => post.title));
const seedPostSummaries = new Set(seedPosts.map(post => post.summary));
const summaryMediaTokenPattern = /\[\[media:([a-z0-9_-]+)\]\]/ig;
const contentCache = {
  payload: null,
  expiresAt: 0
};
const CONTENT_TTL_MS = 15000;
const SNAPSHOT_OBJECT_PATH = 'cms/site-content-snapshot.json';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign({
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }, headers)
  });
}

function normalizeSupabaseUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '');
}

function normalizeAttachments(attachments) {
  return Array.isArray(attachments)
    ? attachments
        .filter(item => item && item.src && item.kind && item.name)
        .map((item, index) => ({
          id: item.id || item.token || `asset-${index}-${Math.random().toString(36).slice(2, 7)}`,
          token: item.token || '',
          placement: item.placement || (index === 0 ? 'cover' : 'inline'),
          name: item.name,
          kind: item.kind,
          size: item.size || 0,
          src: item.src
        }))
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

function isSeedPost(post) {
  if (!post || typeof post !== 'object') return false;
  const id = String(post.id || '').trim();
  const title = String(post.title || '').trim();
  const summary = String(post.summary || '').trim();
  return seedPostIds.has(id) || (seedPostTitles.has(title) && seedPostSummaries.has(summary));
}

function stripSeedPosts(posts) {
  return Array.isArray(posts) ? posts.filter(post => !isSeedPost(post)) : [];
}

function extractReferencedTokens(text) {
  const found = [];
  const source = String(text || '');
  let match;
  const regex = new RegExp(summaryMediaTokenPattern.source, 'ig');
  while ((match = regex.exec(source))) found.push(match[1]);
  return found;
}

function getCoverAttachment(attachments) {
  const normalized = normalizeAttachments(attachments);
  return normalized.find(item => item.placement === 'cover') || normalized[0] || null;
}

function getInlineAttachments(attachments) {
  const normalized = normalizeAttachments(attachments);
  const cover = getCoverAttachment(normalized);
  return normalized.filter(item => !cover || item.id !== cover.id);
}

function getInlineAttachmentsForText(text, attachments) {
  const normalized = normalizeAttachments(attachments);
  const referencedTokens = new Set(extractReferencedTokens(text));
  return normalized.filter(item => item.placement === 'inline' || (item.token && referencedTokens.has(item.token)));
}

function getConfig(env) {
  return {
    supabaseUrl: normalizeSupabaseUrl(env.SUPABASE_URL),
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

function base64UrlEncode(bytes) {
  const binary = Array.from(bytes).map(item => String.fromCharCode(item)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
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
    return Boolean(data.exp && data.exp > Date.now());
  } catch (_) {
    return false;
  }
}

async function requireAuth(request, env) {
  const config = getConfig(env);
  if (!hasAuth(config)) {
    throw Object.assign(new Error('CMS auth is not configured yet. Add CMS_SESSION_SECRET.'), { status: 503 });
  }
  const cookies = parseCookies(request);
  const ok = await verifySessionToken(cookies.gd_host_session, config.sessionSecret);
  if (!ok) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
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
    throw Object.assign(new Error(body || 'Supabase request failed.'), {
      status: response.status,
      body
    });
  }
  return response;
}

function cloneContentPayload(payload) {
  return JSON.parse(JSON.stringify(payload));
}

function encodeStoragePath(path) {
  return String(path || '')
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

function getPublicObjectUrl(config, path) {
  return `${config.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${encodeStoragePath(path)}`;
}

function parseDataUrl(value) {
  const source = String(value || '').trim();
  const match = source.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i);
  if (!match) return null;
  return {
    mime: match[1] || 'application/octet-stream',
    base64: match[2]
  };
}

function sanitizePublicSite(site) {
  const next = Object.assign({}, defaultSite, site || {});
  delete next.hostPasscodeHash;
  return next;
}

function buildPublicPayload(site, posts, configured) {
  return {
    site: sanitizePublicSite(site),
    posts: stripSeedPosts(posts.map(row => normalizePost({
      id: row.id,
      title: row.title,
      kind: row.kind,
      audience: row.audience,
      date: row.date_label || row.date,
      summary: row.summary,
      media: row.media_note || row.media,
      attachments: row.attachments || []
    }))),
    configured
  };
}

function invalidateContentCache() {
  contentCache.payload = null;
  contentCache.expiresAt = 0;
}

async function fetchStoredSite(env) {
  const siteResponse = await supabaseFetch(env, '/rest/v1/site_content?slug=eq.main&select=*');
  const siteRows = await siteResponse.json();
  const site = siteRows.length
    ? Object.assign({}, defaultSite, siteRows[0].payload || {})
    : Object.assign({}, defaultSite);
  return migrateSiteInlineAssets(env, site);
}

async function fetchStoredPosts(env) {
  const postsResponse = await supabaseFetch(env, '/rest/v1/posts?select=*&order=position.desc');
  return postsResponse.json();
}

async function readPublicSnapshot(env) {
  const config = getConfig(env);
  const response = await fetch(getPublicObjectUrl(config, SNAPSHOT_OBJECT_PATH), {
    headers: { accept: 'application/json' }
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw Object.assign(new Error('Public content snapshot could not be read.'), { status: response.status });
  }
  const payload = await response.json();
  if (!payload || typeof payload !== 'object') return null;
  return {
    site: sanitizePublicSite(payload.site),
    posts: stripSeedPosts(payload.posts || []).map(normalizePost),
    configured: Boolean(payload.configured)
  };
}

async function writePublicSnapshot(env, payload) {
  const config = getConfig(env);
  await supabaseFetch(env, `/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeStoragePath(SNAPSHOT_OBJECT_PATH)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-upsert': 'true'
    },
    body: JSON.stringify({
      site: sanitizePublicSite(payload.site),
      posts: payload.posts.map(normalizePost),
      configured: Boolean(payload.configured),
      updatedAt: new Date().toISOString()
    })
  });
}

async function refreshPublicSnapshot(env) {
  const [site, posts] = await Promise.all([
    fetchStoredSite(env),
    fetchStoredPosts(env)
  ]);
  const payload = buildPublicPayload(site, posts, true);
  await writePublicSnapshot(env, payload);
  contentCache.payload = cloneContentPayload(payload);
  contentCache.expiresAt = Date.now() + CONTENT_TTL_MS;
  return payload;
}

async function fetchContent(env, options = {}) {
  const config = getConfig(env);
  if (!hasPersistence(config)) {
    return {
      site: Object.assign({}, defaultSite),
      posts: seedPosts.map(normalizePost),
      configured: false
    };
  }

  if (!options.fresh && contentCache.payload && contentCache.expiresAt > Date.now()) {
    return cloneContentPayload(contentCache.payload);
  }

  if (!options.fresh) {
    try {
      const snapshot = await readPublicSnapshot(env);
      if (snapshot) {
        contentCache.payload = cloneContentPayload(snapshot);
        contentCache.expiresAt = Date.now() + CONTENT_TTL_MS;
        return snapshot;
      }
    } catch (_) {}
  }

  const [site, posts] = await Promise.all([
    fetchStoredSite(env),
    fetchStoredPosts(env)
  ]);
  const payload = buildPublicPayload(site, posts, true);

  contentCache.payload = cloneContentPayload(payload);
  contentCache.expiresAt = Date.now() + CONTENT_TTL_MS;
  return payload;
}

async function fileToDataUrl(file, body) {
  const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  const mime = file.type || 'application/octet-stream';
  return `data:${mime};base64,${btoa(binary)}`;
}

async function uploadBytes(env, bytes, contentType, folder, filenameHint) {
  const config = getConfig(env);
  const hint = String(filenameHint || 'asset').trim().toLowerCase();
  const extension = hint.includes('.') ? hint.split('.').pop() : '';
  const safeExt = extension || (String(contentType || '').startsWith('video/') ? 'mp4' : 'jpg');
  const path = `${folder}/${crypto.randomUUID()}.${safeExt}`;
  const upload = () => supabaseFetch(env, `/storage/v1/object/${config.bucket}/${path}`, {
    method: 'POST',
    headers: {
      'content-type': contentType || 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: bytes
  });

  try {
    await upload();
  } catch (error) {
    const missingBucket = error.status === 404 && String(error.body || '').includes('Bucket not found');
    if (!missingBucket) throw error;
    await ensureBucket(env);
    await upload();
  }

  return `${config.supabaseUrl}/storage/v1/object/public/${config.bucket}/${path}`;
}

async function uploadDataUrl(env, value, folder, filenameHint) {
  const parsed = parseDataUrl(value);
  if (!parsed) return value || '';
  const binary = Uint8Array.from(atob(parsed.base64), char => char.charCodeAt(0));
  return uploadBytes(env, binary, parsed.mime, folder, filenameHint);
}

async function ensureBucket(env) {
  const config = getConfig(env);
  try {
    await supabaseFetch(env, `/storage/v1/bucket/${encodeURIComponent(config.bucket)}`);
    return;
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  await supabaseFetch(env, '/storage/v1/bucket', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: config.bucket, name: config.bucket, public: true })
  });
}

async function uploadFile(env, file, folder) {
  const extension = String(file.name || 'asset').split('.').pop().toLowerCase();
  const safeExt = extension && extension !== String(file.name || '') ? extension : ((file.type || '').startsWith('video/') ? 'mp4' : 'jpg');
  const body = await file.arrayBuffer();

  try {
    return await uploadBytes(env, body, file.type || 'application/octet-stream', folder, `asset.${safeExt}`);
  } catch (error) {
    const missingBucket = error.status === 404 && String(error.body || '').includes('Bucket not found');
    if (!missingBucket) throw error;
    try {
      await ensureBucket(env);
      return await uploadBytes(env, body, file.type || 'application/octet-stream', folder, `asset.${safeExt}`);
    } catch (retryError) {
      const stillMissingBucket = retryError.status === 404 && String(retryError.body || '').includes('Bucket not found');
      if (!stillMissingBucket) throw retryError;
      return fileToDataUrl(file, body);
    }
  }
}

async function resolveSiteAsset(formData, fieldName, previousValue) {
  const clearKey = `clear${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
  if (String(formData.get(clearKey) || '') === '1') return '';
  const url = String(formData.get(`${fieldName}Url`) || '').trim();
  const file = formData.get(`${fieldName}File`);
  if (file && typeof file === 'object' && file.size > 0) {
    return uploadFile(env, file, 'site');
  }
  if (url) return url;
  return previousValue || '';
}

async function migrateSiteInlineAssets(env, site) {
  const next = Object.assign({}, defaultSite, site || {});
  const fields = [
    ['heroCoverSrc', 'hero-cover'],
    ['profileImageSrc', 'profile-image'],
    ['featuredImageSrc', 'featured-media']
  ];
  let changed = false;

  for (const [fieldName, filenameHint] of fields) {
    if (!String(next[fieldName] || '').startsWith('data:')) continue;
    next[fieldName] = await uploadDataUrl(env, next[fieldName], 'site', filenameHint);
    changed = true;
  }

  if (changed) {
    await supabaseFetch(env, '/rest/v1/site_content?on_conflict=slug', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify([{ slug: 'main', payload: next }])
    });
  }

  return next;
}

async function extractSiteInlineAttachments(env, formData, existingAttachments) {
  const text = String(formData.get('featuredCopy') || '').trim();
  const referencedTokens = new Set(extractReferencedTokens(text));
  const inlineFiles = formData.getAll('featuredInlineFiles').filter(file => file && typeof file === 'object' && file.size > 0);
  const inlineTokens = formData.getAll('featuredInlineTokens').map(value => String(value || '').trim());
  const existing = getInlineAttachmentsForText(text, existingAttachments);
  const kept = existing.filter(item => !item.token || referencedTokens.has(item.token));
  const created = [];

  for (let index = 0; index < inlineFiles.length; index += 1) {
    const file = inlineFiles[index];
    const token = inlineTokens[index] || crypto.randomUUID();
    created.push({
      id: crypto.randomUUID(),
      token,
      placement: 'inline',
      name: file.name,
      kind: (file.type || '').startsWith('video/') ? 'video' : 'image',
      size: file.size,
      src: await uploadFile(env, file, 'site')
    });
  }

  return kept.concat(created);
}

async function saveSite(env, request) {
  const config = await requireAuth(request, env);
  if (!hasPersistence(config)) {
    throw new Error('CMS storage is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const existingSite = await fetchStoredSite(env);
  const formData = await request.formData();
  const payload = Object.assign({}, existingSite, {
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
    resumeLabel: '',
    resumeUrl: ''
  });

  payload.heroCoverSrc = await resolveSiteAsset(formData, 'heroCover', existingSite.heroCoverSrc);
  payload.profileImageSrc = await resolveSiteAsset(formData, 'profileImage', existingSite.profileImageSrc);
  payload.featuredImageSrc = await resolveSiteAsset(formData, 'featuredImage', existingSite.featuredImageSrc);
  payload.featuredInlineAttachments = await extractSiteInlineAttachments(env, formData, existingSite.featuredInlineAttachments);

  const newPasscode = String(formData.get('newPasscode') || '').trim();
  if (newPasscode && newPasscode.length < 4) {
    throw new Error('Use at least 4 characters for the studio passcode.');
  }
  if (newPasscode) {
    if (!config.sessionSecret) {
      throw new Error('CMS_SESSION_SECRET is required before rotating the host passcode.');
    }
    payload.hostPasscodeHash = await sha256Hex(newPasscode);
  }

  await supabaseFetch(env, '/rest/v1/site_content?on_conflict=slug', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify([{ slug: 'main', payload }])
  });

  invalidateContentCache();
  await refreshPublicSnapshot(env);
  return payload;
}

async function extractAttachments(env, formData, existingAttachments) {
  const removeAll = String(formData.get('removeAttachments') || '') === '1';
  const coverFile = formData.get('coverFile');
  const inlineFiles = formData.getAll('inlineFiles').filter(file => file && typeof file === 'object' && file.size > 0);
  const inlineTokens = formData.getAll('inlineTokens').map(value => String(value || '').trim());
  const galleryFiles = formData.getAll('files').filter(file => file && typeof file === 'object' && file.size > 0);
  const summary = String(formData.get('summary') || '').trim();
  const referencedTokens = new Set(extractReferencedTokens(summary));
  const existing = removeAll ? [] : normalizeAttachments(existingAttachments);

  let coverAttachment = removeAll ? null : getCoverAttachment(existing);
  if (coverFile && typeof coverFile === 'object' && coverFile.size > 0) {
    coverAttachment = {
      id: crypto.randomUUID(),
      token: '',
      placement: 'cover',
      name: coverFile.name,
      kind: (coverFile.type || '').startsWith('video/') ? 'video' : 'image',
      size: coverFile.size,
      src: await uploadFile(env, coverFile, 'posts')
    };
  }

  let inlineAttachments = removeAll
    ? []
    : getInlineAttachments(existing).filter(item => !item.token || referencedTokens.has(item.token));

  for (let index = 0; index < inlineFiles.length; index += 1) {
    const file = inlineFiles[index];
    const token = inlineTokens[index] || crypto.randomUUID();
    inlineAttachments.push({
      id: crypto.randomUUID(),
      token,
      placement: 'inline',
      name: file.name,
      kind: (file.type || '').startsWith('video/') ? 'video' : 'image',
      size: file.size,
      src: await uploadFile(env, file, 'posts')
    });
  }

  for (const file of galleryFiles) {
    inlineAttachments.push({
      id: crypto.randomUUID(),
      token: '',
      placement: 'inline',
      name: file.name,
      kind: (file.type || '').startsWith('video/') ? 'video' : 'image',
      size: file.size,
      src: await uploadFile(env, file, 'posts')
    });
  }

  return (coverAttachment ? [coverAttachment] : []).concat(inlineAttachments);
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

  invalidateContentCache();
  await refreshPublicSnapshot(env);
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
  await supabaseFetch(env, `/rest/v1/posts?id=eq.${encodeURIComponent(postId)}`, { method: 'DELETE' });
  invalidateContentCache();
  await refreshPublicSnapshot(env);
}

async function handleFetch(request, env) {
  const url = new URL(request.url);

  try {
    if (request.method === 'GET' && url.pathname === '/api/content') {
      const payload = await fetchContent(env);
      return json(payload, 200, {
        'cache-control': 'public, max-age=30, stale-while-revalidate=300',
        'cdn-cache-control': 'public, s-maxage=300, stale-while-revalidate=900',
        'vercel-cdn-cache-control': 'public, s-maxage=300, stale-while-revalidate=900'
      });
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
      const storedSite = hasPersistence(config) ? await fetchStoredSite(env) : Object.assign({}, defaultSite);
      const storedHash = storedSite.hostPasscodeHash || '';
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

  return json({ error: 'Not found.' }, 404);
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

function getEnv() {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || '',
    CMS_SESSION_SECRET: process.env.CMS_SESSION_SECRET || '',
    CMS_HOST_PASSWORD: process.env.CMS_HOST_PASSWORD || ''
  };
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

  return handleFetch(new Request(url.toString(), init), getEnv());
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

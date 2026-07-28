(function () {
  const mode = /studio\.html$/i.test(location.pathname) ? 'studio' : 'viewer';
  document.body.dataset.mode = mode;

  const maxAttachmentCount = 6;
  const maxAttachmentBytes = 25 * 1024 * 1024;
  const contentVersionKey = 'gd-content-version';
  const summaryMediaTokenPattern = /\[\[media:([a-z0-9_-]+)\]\]/ig;

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
  const legacyStorageKeys = [
    'gary-design-site-settings',
    'gary-design-posts',
    'gary-design-studio-passcode',
    'gary-design-studio-auth'
  ];
  const seedPostIds = new Set(seedPosts.map(function (post) { return post.id; }));
  const seedPostTitles = new Set(seedPosts.map(function (post) { return post.title; }));
  const seedPostSummaries = new Set(seedPosts.map(function (post) { return post.summary; }));

  const state = {
    site: Object.assign({}, defaultSite),
    posts: [],
    activeFilter: 'All',
    latestPublishedPostId: null,
    lastFocusedElement: null,
    session: { authenticated: false },
    inlineDraftFiles: [],
    wired: false
  };
  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('gary-design-cms') : null;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function isHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || '').trim());
  }

  function normalizeAttachments(attachments) {
    return Array.isArray(attachments)
      ? attachments
        .filter(function (item) { return item && item.src && item.kind && item.name; })
        .map(function (item, index) {
          return {
            id: item.id || item.token || ('asset-' + index + '-' + Math.random().toString(36).slice(2, 7)),
            token: item.token || '',
            placement: item.placement || (index === 0 ? 'cover' : 'inline'),
            name: item.name,
            kind: item.kind,
            size: item.size || 0,
            src: item.src
          };
        })
      : [];
  }

  function normalizePost(post) {
    return {
      id: post.id || 'post-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
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
    return Array.isArray(posts) ? posts.filter(function (post) { return !isSeedPost(post); }) : [];
  }

  function clearLegacyPrototypeStorage() {
    legacyStorageKeys.forEach(function (key) {
      try { localStorage.removeItem(key); } catch (_) {}
      try { sessionStorage.removeItem(key); } catch (_) {}
    });
  }

  function formatBytes(bytes) {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function attachmentKindLabel(kind) {
    return kind === 'video' ? 'Video' : 'Image';
  }

  function formatTitle(title) {
    const words = String(title || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "Gary's <span>Design</span>";
    if (words.length === 1) return escapeHtml(words[0]);
    const tail = words.pop();
    return escapeHtml(words.join(' ')) + ' <span>' + escapeHtml(tail) + '</span>';
  }

  function slugifyToken(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28) || 'asset';
  }

  function makeInlineToken(name) {
    return 'media-' + slugifyToken(name) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function extractReferencedTokens(text) {
    const found = [];
    const source = String(text || '');
    let match;
    const regex = new RegExp(summaryMediaTokenPattern.source, 'ig');
    while ((match = regex.exec(source))) {
      found.push(match[1]);
    }
    return found;
  }

  function getCoverAttachment(post) {
    const attachments = normalizeAttachments(post.attachments);
    return attachments.find(function (attachment) {
      return attachment.placement === 'cover';
    }) || attachments[0] || null;
  }

  function getInlineAttachments(post) {
    const attachments = normalizeAttachments(post.attachments);
    const cover = getCoverAttachment(post);
    const referencedTokens = new Set(extractReferencedTokens(post.summary));
    return attachments.filter(function (attachment) {
      if (cover && attachment.id === cover.id) return false;
      if (attachment.placement === 'inline') return true;
      return attachment.token && referencedTokens.has(attachment.token);
    });
  }

  function getInlineDraftDescriptors() {
    const editing = currentEditingPost ? currentEditingPost() : null;
    const existing = editing ? getInlineAttachments(editing) : [];
    return existing.concat(state.inlineDraftFiles.map(function (item) {
      return {
        id: item.token,
        token: item.token,
        placement: 'inline',
        name: item.file.name,
        kind: item.file.type.startsWith('video/') ? 'video' : 'image',
        size: item.file.size,
        src: ''
      };
    }));
  }

  function insertAtCursor(field, text) {
    const start = field.selectionStart || 0;
    const end = field.selectionEnd || 0;
    const value = field.value || '';
    field.value = value.slice(0, start) + text + value.slice(end);
    const next = start + text.length;
    field.setSelectionRange(next, next);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function cssHeroCover(src) {
    if (!src) {
      return 'linear-gradient(135deg, rgba(20, 33, 61, 0.5), rgba(17, 24, 39, 0.18)), url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80")';
    }
    return 'linear-gradient(135deg, rgba(20, 33, 61, 0.5), rgba(17, 24, 39, 0.18)), url("' + String(src).replace(/"/g, '\\"') + '")';
  }

  function cssFeaturedVisual(src) {
    if (!src) {
      return 'linear-gradient(135deg, color-mix(in oklch, var(--accent) 70%, white), oklch(30% 0.04 250)), var(--soft)';
    }
    return 'linear-gradient(180deg, rgba(8, 12, 24, 0.1), rgba(8, 12, 24, 0.32)), url("' + String(src).replace(/"/g, '\\"') + '")';
  }

  function toErrorMessage(error, fallback) {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return fallback;
  }

  async function request(path, options) {
    const response = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}));
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
    if (!response.ok) {
      throw new Error(typeof body === 'string' ? body : (body && body.error) || 'Request failed.');
    }
    return body;
  }

  async function apiGetContent() {
    const payload = await request('/api/content');
    state.site = Object.assign({}, defaultSite, payload.site || {});
    state.posts = stripSeedPosts(payload.posts).map(normalizePost);
  }

  async function apiGetSession() {
    try {
      const payload = await request('/api/session');
      state.session = payload || { authenticated: false };
    } catch (_) {
      state.session = { authenticated: false };
    }
  }

  async function apiLogin(passcode) {
    const payload = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ passcode: passcode })
    });
    state.session = payload || { authenticated: true };
  }

  async function apiLogout() {
    await request('/api/auth/logout', { method: 'POST' });
    state.session = { authenticated: false };
  }

  async function apiSaveSite(formData) {
    return request('/api/site', {
      method: 'PUT',
      body: formData
    });
  }

  async function apiCreatePost(formData) {
    return request('/api/posts', {
      method: 'POST',
      body: formData
    });
  }

  async function apiUpdatePost(postId, formData) {
    return request('/api/posts/' + encodeURIComponent(postId), {
      method: 'PUT',
      body: formData
    });
  }

  async function apiDeletePost(postId) {
    return request('/api/posts/' + encodeURIComponent(postId), {
      method: 'DELETE'
    });
  }

  const elements = {
    appShell: document.getElementById('appShell'),
    authShell: document.getElementById('studioAuth'),
    authForm: document.getElementById('authForm'),
    authPasscode: document.getElementById('authPasscode'),
    authConfirmWrap: document.getElementById('authConfirmWrap'),
    authMessage: document.getElementById('authMessage'),
    authTitle: document.getElementById('authTitle'),
    authCopy: document.getElementById('authCopy'),
    authSubmit: document.getElementById('authSubmit'),
    menuToggle: document.querySelector('[data-menu-toggle]'),
    mobileMenu: document.getElementById('mobileMenu'),
    brandLabel: document.getElementById('brandLabel'),
    heroTitle: document.getElementById('heroTitle'),
    introHeading: document.getElementById('introHeading'),
    introCopy: document.getElementById('introCopy'),
    profilePortrait: document.getElementById('profilePortrait'),
    profileName: document.getElementById('profileName'),
    profileRole: document.getElementById('profileRole'),
    profileBio: document.getElementById('profileBio'),
    featuredVisual: document.getElementById('featuredVisual'),
    featuredEyebrow: document.getElementById('featuredEyebrow'),
    featuredTitle: document.getElementById('featuredTitle'),
    featuredCopy: document.getElementById('featuredCopy'),
    featuredButton: document.getElementById('featuredButton'),
    contactHeading: document.getElementById('contactHeading'),
    contactCopy: document.getElementById('contactCopy'),
    contactEmailLink: document.getElementById('contactEmailLink'),
    linkedinLink: document.getElementById('linkedinLink'),
    resumeLink: document.getElementById('resumeLink'),
    searchInput: document.getElementById('searchInput'),
    filtersEl: document.getElementById('filters'),
    resultSummary: document.getElementById('resultSummary'),
    postsEl: document.getElementById('posts'),
    dialog: document.getElementById('postDialog'),
    dialogTitle: document.getElementById('dialogTitle'),
    dialogBody: document.getElementById('dialogBody'),
    postForm: document.getElementById('postForm'),
    editingPostId: document.getElementById('editingPostId'),
    titleInput: document.getElementById('postTitle'),
    kindInput: document.getElementById('postKind'),
    audienceInput: document.getElementById('postAudience'),
    summaryInput: document.getElementById('postSummary'),
    mediaInput: document.getElementById('postMedia'),
    filesInput: document.getElementById('postFiles'),
    attachmentPreview: document.getElementById('attachmentPreview'),
    removeAttachments: document.getElementById('removeAttachments'),
    removeAttachmentsWrap: document.getElementById('removeAttachmentsWrap'),
    formMessage: document.getElementById('formMessage'),
    publishButton: document.getElementById('publishButton'),
    cancelEditButton: document.getElementById('cancelEditButton'),
    siteForm: document.getElementById('siteForm'),
    siteMessage: document.getElementById('siteMessage')
  };

  function paintAssetPreview(id, src) {
    const element = document.getElementById(id);
    if (!element) return;
    if (!src) {
      element.classList.remove('has-image');
      element.style.backgroundImage = '';
      if (id === 'heroCoverPreview') element.textContent = 'Current hero cover preview';
      if (id === 'profileImagePreview') element.textContent = 'Current profile image preview';
      if (id === 'featuredImagePreview') element.textContent = 'Current featured image preview';
      return;
    }
    element.classList.add('has-image');
    element.style.backgroundImage = 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.2)), url("' + String(src).replace(/"/g, '\\"') + '")';
    element.textContent = ' ';
  }

  function applySite() {
    document.title = state.site.siteTitle || defaultSite.siteTitle;
    elements.brandLabel.textContent = state.site.siteTitle || defaultSite.siteTitle;
    elements.heroTitle.innerHTML = formatTitle(state.site.siteTitle || defaultSite.siteTitle);
    elements.introHeading.textContent = state.site.introHeading || defaultSite.introHeading;
    elements.introCopy.textContent = state.site.introCopy || defaultSite.introCopy;
    elements.profileName.textContent = state.site.profileName || defaultSite.profileName;
    elements.profileRole.textContent = state.site.profileRole || defaultSite.profileRole;
    elements.profileBio.textContent = state.site.profileBio || defaultSite.profileBio;
    elements.featuredEyebrow.textContent = state.site.featuredEyebrow || defaultSite.featuredEyebrow;
    elements.featuredTitle.textContent = state.site.featuredTitle || defaultSite.featuredTitle;
    elements.featuredCopy.textContent = state.site.featuredCopy || defaultSite.featuredCopy;
    elements.contactHeading.textContent = state.site.contactHeading || defaultSite.contactHeading;
    elements.contactCopy.textContent = state.site.contactCopy || defaultSite.contactCopy;
    elements.contactEmailLink.textContent = state.site.contactEmail || defaultSite.contactEmail;
    elements.contactEmailLink.href = 'mailto:' + (state.site.contactEmail || defaultSite.contactEmail);

    if (state.site.linkedinUrl) {
      elements.linkedinLink.textContent = state.site.linkedinLabel || defaultSite.linkedinLabel;
      elements.linkedinLink.href = state.site.linkedinUrl;
      elements.linkedinLink.classList.remove('muted-link');
      elements.linkedinLink.removeAttribute('aria-disabled');
    } else {
      elements.linkedinLink.textContent = state.site.linkedinLabel || defaultSite.linkedinLabel;
      elements.linkedinLink.href = '#';
      elements.linkedinLink.classList.add('muted-link');
      elements.linkedinLink.setAttribute('aria-disabled', 'true');
    }

    if (elements.resumeLink) {
      elements.resumeLink.hidden = true;
    }

    document.documentElement.style.setProperty('--hero-cover-image', cssHeroCover(state.site.heroCoverSrc));
    document.documentElement.style.setProperty('--featured-visual-image', cssFeaturedVisual(state.site.featuredImageSrc));

    if (state.site.profileImageSrc) {
      elements.profilePortrait.style.backgroundImage = 'url("' + String(state.site.profileImageSrc).replace(/"/g, '\\"') + '")';
      elements.profilePortrait.classList.add('has-image');
    } else {
      elements.profilePortrait.style.backgroundImage = '';
      elements.profilePortrait.classList.remove('has-image');
    }

    if (state.site.featuredImageSrc) {
      elements.featuredVisual.classList.add('has-image');
    } else {
      elements.featuredVisual.classList.remove('has-image');
    }
  }

  function populateSiteForm() {
    if (!elements.siteForm) return;
    elements.siteForm.siteTitle.value = state.site.siteTitle || defaultSite.siteTitle;
    elements.siteForm.profileName.value = state.site.profileName || defaultSite.profileName;
    elements.siteForm.introHeading.value = state.site.introHeading || defaultSite.introHeading;
    elements.siteForm.introCopy.value = state.site.introCopy || defaultSite.introCopy;
    elements.siteForm.profileRole.value = state.site.profileRole || defaultSite.profileRole;
    elements.siteForm.profileBio.value = state.site.profileBio || defaultSite.profileBio;
    elements.siteForm.heroCoverUrl.value = isHttpUrl(state.site.heroCoverSrc) ? state.site.heroCoverSrc : '';
    elements.siteForm.profileImageUrl.value = isHttpUrl(state.site.profileImageSrc) ? state.site.profileImageSrc : '';
    elements.siteForm.featuredEyebrow.value = state.site.featuredEyebrow || defaultSite.featuredEyebrow;
    elements.siteForm.featuredTitle.value = state.site.featuredTitle || defaultSite.featuredTitle;
    elements.siteForm.featuredCopy.value = state.site.featuredCopy || defaultSite.featuredCopy;
    elements.siteForm.featuredMedia.value = state.site.featuredMedia || defaultSite.featuredMedia;
    elements.siteForm.featuredImageUrl.value = isHttpUrl(state.site.featuredImageSrc) ? state.site.featuredImageSrc : '';
    elements.siteForm.contactHeading.value = state.site.contactHeading || defaultSite.contactHeading;
    elements.siteForm.contactCopy.value = state.site.contactCopy || defaultSite.contactCopy;
    elements.siteForm.contactEmail.value = state.site.contactEmail || defaultSite.contactEmail;
    elements.siteForm.linkedinLabel.value = state.site.linkedinLabel || defaultSite.linkedinLabel;
    elements.siteForm.linkedinUrl.value = state.site.linkedinUrl || '';
    elements.siteForm.newPasscode.value = '';
    paintAssetPreview('heroCoverPreview', state.site.heroCoverSrc);
    paintAssetPreview('profileImagePreview', state.site.profileImageSrc);
    paintAssetPreview('featuredImagePreview', state.site.featuredImageSrc);
  }

  function renderAttachmentPreview(target, attachments, emptyMessage) {
    if (!target) return;
    if (!attachments.length) {
      target.classList.add('is-empty');
      target.innerHTML = escapeHtml(emptyMessage);
      return;
    }
    target.classList.remove('is-empty');
    target.innerHTML = attachments.map(function (attachment) {
      const name = attachment.name || 'Selected file';
      const size = attachment.size ? formatBytes(attachment.size) : 'Saved asset';
      const label = attachmentKindLabel(attachment.kind || 'image');
      return [
        '<div class="attachment-item">',
        '<div><strong>' + escapeHtml(name) + '</strong><span>' + escapeHtml(label) + ' - ' + escapeHtml(size) + '</span></div>',
        '<span class="attachment-tag">' + escapeHtml(label) + '</span>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderInlineMediaPreview() {
    const target = document.getElementById('inlineMediaPreview');
    if (!target) return;
    renderAttachmentPreview(target, getInlineDraftDescriptors(), 'Paste images or videos into the summary field to embed them inline.');
  }

  function getAttachmentSummary(post) {
    const attachments = normalizeAttachments(post.attachments);
    if (!attachments.length) return post.media || 'Media note open';
    const cover = getCoverAttachment(post);
    const inlineCount = getInlineAttachments(post).length;
    const parts = [];
    if (cover) parts.push('cover');
    if (inlineCount) parts.push(inlineCount + ' inline ' + (inlineCount === 1 ? 'asset' : 'assets'));
    const label = parts.join(' + ') || (attachments.length + ' attachments');
    return post.media ? label + ' + note' : label;
  }

  function renderParagraphs(text, className) {
    const paragraphs = String(text || '')
      .replace(/\r\n?/g, '\n')
      .split(/\n\s*\n/)
      .map(function (paragraph) { return paragraph.trim(); })
      .filter(Boolean);
    if (!paragraphs.length) {
      return '<p class="' + className + '"></p>';
    }
    return paragraphs.map(function (paragraph) {
      return '<p class="' + className + '">' + escapeHtml(paragraph).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function renderMediaAsset(attachment, className) {
    if (!attachment) return '';
    if (attachment.kind === 'video') {
      return '<video class="' + className + '" src="' + escapeAttribute(attachment.src) + '" controls preload="metadata"></video>';
    }
    return '<img class="' + className + '" src="' + escapeAttribute(attachment.src) + '" alt="' + escapeAttribute(attachment.name) + '" />';
  }

  function renderSummaryFlow(post, paragraphClass, mediaClass) {
    const cover = getCoverAttachment(post);
    const inlineAttachments = getInlineAttachments(post);
    const inlineByToken = new Map(inlineAttachments.map(function (attachment) {
      return [attachment.token, attachment];
    }));
    const referenced = new Set();
    const blocks = [];
    const source = String(post.summary || '').replace(/\r\n?/g, '\n');
    let cursor = 0;
    let match;
    const regex = new RegExp(summaryMediaTokenPattern.source, 'ig');

    function pushParagraphs(text) {
      String(text || '')
        .split(/\n\s*\n/)
        .map(function (paragraph) { return paragraph.trim(); })
        .filter(Boolean)
        .forEach(function (paragraph) {
          blocks.push('<p class="' + paragraphClass + '">' + escapeHtml(paragraph).replace(/\n/g, '<br>') + '</p>');
        });
    }

    while ((match = regex.exec(source))) {
      pushParagraphs(source.slice(cursor, match.index));
      cursor = regex.lastIndex;
      const token = match[1];
      const attachment = inlineByToken.get(token);
      if (attachment) {
        referenced.add(token);
        blocks.push('<figure class="' + mediaClass + '">' + renderMediaAsset(attachment, mediaClass + '-asset') + '<figcaption>' + escapeHtml(attachment.name) + '</figcaption></figure>');
      }
    }
    pushParagraphs(source.slice(cursor));

    inlineAttachments.forEach(function (attachment) {
      if (!attachment.token || referenced.has(attachment.token)) return;
      blocks.push('<figure class="' + mediaClass + '">' + renderMediaAsset(attachment, mediaClass + '-asset') + '<figcaption>' + escapeHtml(attachment.name) + '</figcaption></figure>');
    });

    if (!blocks.length && cover) {
      blocks.push('<p class="' + paragraphClass + '"></p>');
    }
    return blocks.join('');
  }

  function renderCardMedia(post) {
    const first = getCoverAttachment(post);
    if (!first) return '<span class="media-badge">' + escapeHtml(post.kind) + '</span>';
    return [
      '<span class="media-badge">' + escapeHtml(post.kind) + '</span>',
      '<div class="post-media-frame">' + renderMediaAsset(first, 'post-media-asset') + '</div>',
      '<div class="post-media-stack">',
      '<p>' + escapeHtml(first.name) + '</p>',
      getInlineAttachments(post).length
        ? '<span class="post-media-count">+' + getInlineAttachments(post).length + ' inline</span>'
        : '<span class="attachment-tag">' + escapeHtml(attachmentKindLabel(first.kind)) + '</span>',
      '</div>'
    ].join('');
  }

  function renderDialogMedia(post) {
    const cover = getCoverAttachment(post);
    const linkMarkup = isHttpUrl(post.media)
      ? '<a class="dialog-media-link" href="' + escapeAttribute(post.media) + '" target="_blank" rel="noreferrer">' + escapeHtml(post.media) + '</a>'
      : (post.media ? '<p>' + escapeHtml(post.media) + '</p>' : '');
    if (cover) {
      return [
        '<div class="embed-box has-media">',
        '<div class="dialog-hero-media">' + renderMediaAsset(cover, 'dialog-hero-asset') + '</div>',
        linkMarkup,
        '</div>'
      ].join('');
    }
    if (isHttpUrl(post.media)) {
      return '<div class="embed-box"><strong>Open linked media</strong><a class="dialog-media-link" href="' + escapeAttribute(post.media) + '" target="_blank" rel="noreferrer">' + escapeHtml(post.media) + '</a></div>';
    }
    return '<div class="embed-box"><strong>' + escapeHtml(post.media || 'Media placeholder') + '</strong></div>';
  }

  function matches(post) {
    const query = elements.searchInput.value.trim().toLowerCase();
    const haystack = [
      post.title,
      post.kind,
      post.audience,
      post.summary,
      post.media
    ].concat(normalizeAttachments(post.attachments).map(function (item) { return item.name; })).join(' ').toLowerCase();
    const kindMatch = state.activeFilter === 'All' || post.kind === state.activeFilter;
    return kindMatch && (!query || haystack.includes(query));
  }

  function renderPosts() {
    const visible = state.posts.filter(matches);
    const query = elements.searchInput.value.trim();
    const filterLabel = state.activeFilter === 'All' ? 'all formats' : state.activeFilter.toLowerCase();
    elements.resultSummary.textContent = visible.length
      ? 'Showing ' + visible.length + ' ' + (visible.length === 1 ? 'entry' : 'entries') + ' for ' + filterLabel + (query ? ' matching "' + query + '"' : '') + '.'
      : 'No entries found for ' + filterLabel + (query ? ' matching "' + query + '"' : '') + '.';

    if (!visible.length) {
      elements.postsEl.innerHTML = [
        '<div class="empty">',
        '<strong>No matching posts yet.</strong>',
        '<span>Clear the search or adjust the filters.</span>',
        '<button class="btn-secondary" type="button" data-clear-filters>Show all posts</button>',
        '</div>'
      ].join('');
      return;
    }

    elements.postsEl.innerHTML = visible.map(function (post, index) {
      const isDark = index % 2 ? 'is-dark' : '';
      const isNew = post.id === state.latestPublishedPostId ? 'is-new' : '';
      const hostActions = mode === 'studio' && state.session.authenticated
        ? '<div class="host-actions studio-only"><button class="btn-ghost" type="button" data-edit-post="' + escapeAttribute(post.id) + '">Edit</button><button class="btn-danger" type="button" data-delete-post="' + escapeAttribute(post.id) + '">Delete</button></div>'
        : '';
      const avatarStyle = state.site.profileImageSrc
        ? ' style="background-image:url(&quot;' + escapeAttribute(state.site.profileImageSrc) + '&quot;)"'
        : '';
      return [
        '<article class="post-row ' + isDark + ' ' + isNew + '" data-kind="' + escapeAttribute(post.kind) + '" data-post-id="' + escapeAttribute(post.id) + '">',
        '<div class="post-media" data-kind="' + escapeAttribute(post.kind) + '">',
        renderCardMedia(post),
        '</div>',
        '<div class="post-content">',
        '<div class="post-meta"><span>' + escapeHtml(post.date || 'Draft post') + '</span><span>' + escapeHtml(post.audience || 'Audience to define') + '</span><span>' + escapeHtml(getAttachmentSummary(post)) + '</span></div>',
        '<h2 class="post-title">' + escapeHtml(post.title) + '</h2>',
        '<div class="post-summary-flow">' + renderSummaryFlow(post, 'post-excerpt', 'inline-media-card') + '</div>',
        '<div class="author-line"><span class="mini-avatar"' + avatarStyle + ' aria-hidden="true"></span><span>' + escapeHtml(state.site.siteTitle) + ' entry</span></div>',
        '<button class="open-post" type="button" data-open-post="' + escapeAttribute(post.id) + '">Open post</button>',
        hostActions,
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function currentEditingPost() {
    return state.posts.find(function (post) { return post.id === elements.editingPostId.value; }) || null;
  }

  function resetComposer(message) {
    elements.postForm.reset();
    elements.editingPostId.value = '';
    elements.removeAttachments.checked = false;
    elements.removeAttachmentsWrap.hidden = true;
    state.inlineDraftFiles = [];
    const coverPreview = document.getElementById('postCoverPreview');
    if (coverPreview) renderAttachmentPreview(coverPreview, [], 'No featured cover selected yet.');
    renderAttachmentPreview(elements.attachmentPreview, [], 'No files selected yet.');
    renderInlineMediaPreview();
    elements.publishButton.textContent = 'Publish post';
    elements.cancelEditButton.hidden = true;
    elements.formMessage.style.color = 'var(--muted)';
    elements.formMessage.textContent = message || 'Create a new post for the public portfolio feed.';
  }

  function startEditingPost(post) {
    elements.editingPostId.value = post.id;
    elements.titleInput.value = post.title;
    elements.kindInput.value = post.kind;
    elements.audienceInput.value = post.audience;
    elements.summaryInput.value = post.summary;
    elements.mediaInput.value = post.media;
    elements.filesInput.value = '';
    const coverInput = document.getElementById('postCoverFile');
    if (coverInput) coverInput.value = '';
    elements.removeAttachments.checked = false;
    elements.removeAttachmentsWrap.hidden = !normalizeAttachments(post.attachments).length;
    renderAttachmentPreview(document.getElementById('postCoverPreview'), getCoverAttachment(post) ? [getCoverAttachment(post)] : [], 'No featured cover selected yet.');
    renderAttachmentPreview(elements.attachmentPreview, getInlineAttachments(post), 'No files selected yet.');
    state.inlineDraftFiles = [];
    renderInlineMediaPreview();
    elements.publishButton.textContent = 'Save changes';
    elements.cancelEditButton.hidden = false;
    elements.formMessage.style.color = 'var(--muted)';
    elements.formMessage.textContent = 'Editing "' + post.title + '". Add new files to replace the existing attachments, or tick the remove option.';
    jumpToSection('create');
    window.setTimeout(function () {
      elements.titleInput.focus({ preventScroll: true });
    }, 260);
  }

  function openPost(post, options) {
    options = options || {};
    state.lastFocusedElement = document.activeElement;
    elements.dialogTitle.textContent = post.title;
    const studioActions = mode === 'studio' && state.session.authenticated && !options.readOnlyFeatured
      ? '<div class="host-actions studio-only"><button class="btn-ghost" type="button" data-dialog-edit="' + escapeAttribute(post.id) + '">Edit this post</button><button class="btn-danger" type="button" data-dialog-delete="' + escapeAttribute(post.id) + '">Delete this post</button></div>'
      : '';
    elements.dialogBody.innerHTML = [
      '<div class="eyebrow">' + escapeHtml(post.kind) + ' / ' + escapeHtml(post.audience || 'Audience to define') + '</div>',
      renderDialogMedia(post),
      '<div class="dialog-copy">' + renderSummaryFlow(post, 'dialog-paragraph', 'dialog-inline-media') + '</div>',
      studioActions
    ].join('');
    elements.dialog.classList.add('is-open');
    document.body.classList.add('modal-open');
    elements.dialog.querySelector('[data-close-dialog]').focus();
  }

  function closeDialog() {
    elements.dialog.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
      state.lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function keepFocusInDialog(event) {
    const focusable = elements.dialog.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function closeMobileMenu() {
    elements.mobileMenu.classList.remove('is-open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
  }

  function jumpToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.pageYOffset - 78;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function focusPublishedPost(postId) {
    const target = elements.postsEl.querySelector('[data-post-id="' + postId + '"]');
    if (!target) return;
    window.setTimeout(function () {
      const top = target.getBoundingClientRect().top + window.pageYOffset - 108;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
    }, 80);
  }

  function populateAuthShell() {
    elements.authTitle.textContent = 'Unlock the host studio';
    elements.authCopy.textContent = 'Enter the host passcode to create posts, edit page copy, or change media assets.';
    elements.authConfirmWrap.hidden = true;
    elements.authSubmit.textContent = 'Unlock studio';
  }

  function showAuthShell() {
    populateAuthShell();
    elements.appShell.hidden = true;
    elements.authShell.hidden = false;
    elements.authMessage.textContent = '';
    elements.authPasscode.value = '';
    elements.authPasscode.focus();
  }

  function showAppShell() {
    elements.authShell.hidden = true;
    elements.appShell.hidden = false;
  }

  function setSiteMessage(message, isError) {
    elements.siteMessage.style.color = isError ? 'var(--danger)' : 'var(--success)';
    elements.siteMessage.textContent = message;
  }

  function setFormMessage(message, isError) {
    elements.formMessage.style.color = isError ? 'var(--danger)' : 'var(--success)';
    elements.formMessage.textContent = message;
  }

  async function bootstrap() {
    clearLegacyPrototypeStorage();
    if (mode === 'studio') {
      await apiGetSession();
      if (!state.session.authenticated) {
        showAuthShell();
        wireSharedEvents();
        return;
      }
    }

    showAppShell();
    await refreshContent();
    applySite();
    populateSiteForm();
    renderPosts();
    resetComposer('Create a new post for the public portfolio feed.');
    wireSharedEvents();
  }

  async function refreshContent() {
    try {
      await apiGetContent();
    } catch (error) {
      state.site = Object.assign({}, defaultSite);
      state.posts = [];
      if (mode === 'studio') {
        showAuthShell();
        elements.authMessage.style.color = 'var(--danger)';
        elements.authMessage.textContent = toErrorMessage(error, 'The CMS could not be reached.');
      }
    }
  }

  function wireSharedEvents() {
    if (state.wired) return;
    state.wired = true;

    elements.authForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const passcode = elements.authPasscode.value.trim();
      if (!passcode) {
        elements.authMessage.style.color = 'var(--danger)';
        elements.authMessage.textContent = 'Enter the host passcode first.';
        elements.authPasscode.focus();
        return;
      }
      elements.authSubmit.disabled = true;
      elements.authSubmit.textContent = 'Unlocking...';
      try {
        await apiLogin(passcode);
        showAppShell();
        await refreshContent();
        applySite();
        populateSiteForm();
        renderPosts();
        resetComposer('Create a new post for the public portfolio feed.');
      } catch (error) {
        elements.authMessage.style.color = 'var(--danger)';
        elements.authMessage.textContent = toErrorMessage(error, 'The passcode was not accepted.');
      } finally {
        elements.authSubmit.disabled = false;
        elements.authSubmit.textContent = 'Unlock studio';
      }
    });

    elements.filtersEl.addEventListener('click', function (event) {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      state.activeFilter = button.dataset.filter;
      elements.filtersEl.querySelectorAll('.filter').forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      renderPosts();
    });

    elements.searchInput.addEventListener('input', renderPosts);

    elements.postsEl.addEventListener('click', async function (event) {
      const clearButton = event.target.closest('[data-clear-filters]');
      if (clearButton) {
        state.activeFilter = 'All';
        elements.searchInput.value = '';
        elements.filtersEl.querySelectorAll('.filter').forEach(function (item) {
          item.setAttribute('aria-pressed', String(item.dataset.filter === 'All'));
        });
        renderPosts();
        return;
      }

      const openButton = event.target.closest('[data-open-post]');
      if (openButton) {
        const post = state.posts.find(function (item) { return item.id === openButton.dataset.openPost; });
        if (post) openPost(post);
        return;
      }

      if (mode !== 'studio' || !state.session.authenticated) return;

      const editButton = event.target.closest('[data-edit-post]');
      if (editButton) {
        const post = state.posts.find(function (item) { return item.id === editButton.dataset.editPost; });
        if (post) startEditingPost(post);
        return;
      }

      const deleteButton = event.target.closest('[data-delete-post]');
      if (deleteButton) {
        const post = state.posts.find(function (item) { return item.id === deleteButton.dataset.deletePost; });
        if (!post || !window.confirm('Delete "' + post.title + '" from the live portfolio feed?')) return;
        try {
          await apiDeletePost(post.id);
          state.posts = state.posts.filter(function (item) { return item.id !== post.id; });
          if (elements.editingPostId.value === post.id) resetComposer('The post was deleted.');
          renderPosts();
          announceContentChange();
        } catch (error) {
          setFormMessage(toErrorMessage(error, 'The post could not be deleted.'), true);
        }
      }
    });

    elements.featuredButton.addEventListener('click', function () {
      openPost({
        id: 'featured-preview',
        title: state.site.featuredTitle,
        kind: 'Mixed',
        audience: 'Portfolio reviewers',
        summary: state.site.featuredCopy,
        media: state.site.featuredMedia,
        attachments: state.site.featuredImageSrc ? [{
          name: 'Featured image',
          kind: 'image',
          src: state.site.featuredImageSrc
        }] : []
      }, { readOnlyFeatured: true });
    });

    document.querySelectorAll('[data-close-dialog]').forEach(function (button) {
      button.addEventListener('click', closeDialog);
    });

    elements.dialog.addEventListener('click', async function (event) {
      if (event.target === elements.dialog) closeDialog();
      const editButton = event.target.closest('[data-dialog-edit]');
      const deleteButton = event.target.closest('[data-dialog-delete]');

      if (editButton) {
        const post = state.posts.find(function (item) { return item.id === editButton.dataset.dialogEdit; });
        if (post) {
          closeDialog();
          startEditingPost(post);
        }
      }

      if (deleteButton) {
        const post = state.posts.find(function (item) { return item.id === deleteButton.dataset.dialogDelete; });
        if (!post || !window.confirm('Delete "' + post.title + '" from the live portfolio feed?')) return;
        try {
          await apiDeletePost(post.id);
          state.posts = state.posts.filter(function (item) { return item.id !== post.id; });
          closeDialog();
          renderPosts();
          announceContentChange();
        } catch (error) {
          setFormMessage(toErrorMessage(error, 'The post could not be deleted.'), true);
        }
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!elements.dialog.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeDialog();
      if (event.key === 'Tab') keepFocusInDialog(event);
    });

    if (syncChannel) {
      syncChannel.onmessage = function (event) {
        if (!event || event.data !== 'content-changed') return;
        refreshContent().then(function () {
          applySite();
          populateSiteForm();
          renderPosts();
        }).catch(function () {});
      };
    }

    window.addEventListener('storage', function (event) {
      if (event.key !== contentVersionKey) return;
      refreshContent().then(function () {
        applySite();
        populateSiteForm();
        renderPosts();
      }).catch(function () {});
    });

    elements.menuToggle.addEventListener('click', function () {
      const isOpen = elements.mobileMenu.classList.toggle('is-open');
      elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    elements.mobileMenu.addEventListener('click', function (event) {
      if (event.target.closest('a[href]')) closeMobileMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeMobileMenu();
    });

    if (mode !== 'studio') return;

    elements.filesInput.addEventListener('change', function () {
      const selected = Array.from(elements.filesInput.files || []);
      renderAttachmentPreview(elements.attachmentPreview, selected.map(function (file) {
        return {
          name: file.name,
          size: file.size,
          kind: file.type.startsWith('video/') ? 'video' : 'image'
        };
      }), 'No files selected yet.');
    });

    const coverInput = document.getElementById('postCoverFile');
    if (coverInput) {
      coverInput.addEventListener('change', function () {
        const selected = Array.from(coverInput.files || []);
        renderAttachmentPreview(document.getElementById('postCoverPreview'), selected.map(function (file) {
          return {
            name: file.name,
            size: file.size,
            kind: file.type.startsWith('video/') ? 'video' : 'image'
          };
        }), 'No featured cover selected yet.');
      });
    }

    elements.summaryInput.addEventListener('paste', function (event) {
      const clipboard = event.clipboardData;
      if (!clipboard) return;
      const files = Array.from(clipboard.files || []).filter(function (file) {
        return /^image\/|^video\//.test(file.type || '');
      });
      if (!files.length) return;
      event.preventDefault();
      files.forEach(function (file) {
        const token = makeInlineToken(file.name);
        state.inlineDraftFiles.push({ token: token, file: file });
        insertAtCursor(elements.summaryInput, '\n\n[[media:' + token + ']]\n\n');
      });
      renderInlineMediaPreview();
      setFormMessage('Pasted media will be embedded inline where the marker appears in the summary.', false);
    });

    elements.cancelEditButton.addEventListener('click', function () {
      resetComposer('Edit cancelled.');
    });

    elements.siteForm.querySelectorAll('[data-clear-asset]').forEach(function (button) {
      button.addEventListener('click', function () {
        const asset = button.dataset.clearAsset;
        if (asset === 'heroCover') {
          state.site.heroCoverSrc = '';
          document.getElementById('heroCoverUrlInput').value = '';
          document.getElementById('heroCoverFileInput').value = '';
          paintAssetPreview('heroCoverPreview', '');
        }
        if (asset === 'profileImage') {
          state.site.profileImageSrc = '';
          document.getElementById('profileImageUrlInput').value = '';
          document.getElementById('profileImageFileInput').value = '';
          paintAssetPreview('profileImagePreview', '');
        }
        if (asset === 'featuredImage') {
          state.site.featuredImageSrc = '';
          document.getElementById('featuredImageUrlInput').value = '';
          document.getElementById('featuredImageFileInput').value = '';
          paintAssetPreview('featuredImagePreview', '');
        }
        applySite();
      });
    });

    elements.siteForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const data = new FormData(elements.siteForm);
      const newPasscode = String(data.get('newPasscode') || '').trim();
      if (newPasscode && newPasscode.length < 4) {
        setSiteMessage('Use at least 4 characters for the studio passcode.', true);
        return;
      }

      ['heroCover', 'profileImage', 'featuredImage'].forEach(function (name) {
        const key = 'clear' + name.charAt(0).toUpperCase() + name.slice(1);
        const urlInput = document.getElementById(name + 'UrlInput');
        const fileInput = document.getElementById(name + 'FileInput');
        const srcKey = name + 'Src';
        if (fileInput && fileInput.files && fileInput.files[0]) {
          data.append(name + 'File', fileInput.files[0]);
        }
        const isCleared = !state.site[srcKey] && !(urlInput && urlInput.value.trim()) && !(fileInput && fileInput.files && fileInput.files[0]);
        if (isCleared) data.append(key, '1');
      });

      try {
        const payload = await apiSaveSite(data);
        state.site = Object.assign({}, defaultSite, payload.site || {});
        applySite();
        populateSiteForm();
        announceContentChange();
        setSiteMessage(newPasscode ? 'Page settings saved, and the studio passcode was updated.' : 'Page settings saved.', false);
      } catch (error) {
        setSiteMessage(toErrorMessage(error, 'The page settings could not be saved.'), true);
      }
    });

    elements.postForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const formData = new FormData(elements.postForm);
      const selectedFiles = Array.from(elements.filesInput.files || []);
      const coverFiles = Array.from((document.getElementById('postCoverFile') || {}).files || []);
      const inlineFiles = state.inlineDraftFiles.map(function (item) { return item.file; });
      const totalBytes = selectedFiles.concat(coverFiles).concat(inlineFiles).reduce(function (sum, file) { return sum + file.size; }, 0);
      const existingPost = currentEditingPost();

      if (!elements.titleInput.value.trim()) {
        setFormMessage('Add a title before saving the post.', true);
        elements.titleInput.focus();
        return;
      }
      if (!elements.summaryInput.value.trim()) {
        setFormMessage('Add a summary before saving the post.', true);
        elements.summaryInput.focus();
        return;
      }
      if (coverFiles.length > 1) {
        setFormMessage('Use one featured cover file per post.', true);
        return;
      }
      if (selectedFiles.length > maxAttachmentCount) {
        setFormMessage('Attach up to ' + maxAttachmentCount + ' files per post.', true);
        return;
      }
      if (totalBytes > maxAttachmentBytes) {
        setFormMessage('Attached files are too large. Keep the total under 25 MB per post.', true);
        return;
      }

      elements.publishButton.disabled = true;
      elements.publishButton.textContent = existingPost ? 'Saving...' : 'Publishing...';

      try {
        state.inlineDraftFiles.forEach(function (item) {
          formData.append('inlineFiles', item.file);
          formData.append('inlineTokens', item.token);
        });
        if (elements.removeAttachments.checked) {
          formData.append('removeAttachments', '1');
        }
        const payload = existingPost ? await apiUpdatePost(existingPost.id, formData) : await apiCreatePost(formData);
        const savedPost = normalizePost(payload.post || {});
        if (existingPost) {
          state.posts = state.posts.map(function (post) {
            return post.id === savedPost.id ? savedPost : post;
          });
        } else {
          state.posts = [savedPost].concat(state.posts.filter(function (post) { return post.id !== savedPost.id; }));
        }
        state.latestPublishedPostId = savedPost.id;
        renderPosts();
        focusPublishedPost(savedPost.id);
        openPost(savedPost);
        resetComposer(existingPost ? 'Changes saved and preview opened.' : 'Published to the top of the feed and preview opened.');
        announceContentChange();
        setFormMessage(existingPost ? 'Changes saved. The updated post is open in preview.' : 'Published to the top of the feed and opened as a preview.', false);
        window.setTimeout(function () {
          state.latestPublishedPostId = null;
          renderPosts();
        }, 1400);
      } catch (error) {
        setFormMessage(toErrorMessage(error, 'The post could not be saved.'), true);
      } finally {
        elements.publishButton.disabled = false;
        elements.publishButton.textContent = elements.editingPostId.value ? 'Save changes' : 'Publish post';
      }
    });
  }

  function announceContentChange() {
    try {
      localStorage.setItem(contentVersionKey, String(Date.now()));
    } catch (_) {}
    if (syncChannel) {
      syncChannel.postMessage('content-changed');
    }
  }

  bootstrap();
})();

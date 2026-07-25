const html = String.raw`

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gary's Design</title>
  <style>
    :root {
      --bg: oklch(99% 0.002 240);
      --surface: oklch(100% 0 0);
      --fg: oklch(22% 0.015 250);
      --muted: oklch(49% 0.015 250);
      --border: oklch(91% 0.006 250);
      --accent: oklch(61% 0.07 229);
      --accent-strong: oklch(50% 0.095 229);
      --ink: oklch(17% 0.012 250);
      --dark: oklch(24% 0.024 250);
      --dark-muted: oklch(77% 0.012 245);
      --soft: oklch(96% 0.006 240);
      --success: oklch(59% 0.11 155);
      --warn: oklch(70% 0.13 78);
      --danger: oklch(58% 0.16 25);
      --font-display: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --font-body: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --font-mono: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
      --content: min(1160px, calc(100vw - 40px));
      --radius: 6px;
      --hero-cover-image:
        linear-gradient(135deg, rgba(20, 33, 61, 0.5), rgba(17, 24, 39, 0.18)),
        url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80");
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: var(--font-body);
      -webkit-font-smoothing: antialiased;
      line-height: 1.55;
    }
    body.modal-open { overflow: hidden; }
    a { color: inherit; text-decoration: none; }
    button, input, textarea, select { font: inherit; }
    button { cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: .68; }
    img { max-width: 100%; display: block; }
    :focus-visible {
      outline: 3px solid color-mix(in oklch, var(--accent) 72%, white);
      outline-offset: 4px;
    }

    .skip-link {
      position: fixed;
      left: 16px;
      top: 14px;
      z-index: 80;
      transform: translateY(-140%);
      background: var(--fg);
      color: white;
      padding: 10px 14px;
      border-radius: 999px;
      font-size: .86rem;
      font-weight: 700;
      transition: transform .15s ease;
    }
    .skip-link:focus-visible { transform: translateY(0); }

    .site-nav {
      position: sticky;
      top: 0;
      z-index: 30;
      background: color-mix(in oklch, var(--surface) 92%, transparent);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(16px);
    }
    .nav-inner {
      width: var(--content);
      min-height: 74px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .brand {
      display: inline-flex;
      align-items: baseline;
      gap: 10px;
      font-weight: 800;
      letter-spacing: 0;
      font-size: 1.15rem;
    }
    .brand-mark {
      width: 11px;
      height: 11px;
      background: var(--accent);
      display: inline-block;
      transform: rotate(45deg);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
      font-size: .9rem;
      color: var(--muted);
    }
    .nav-links a:hover { color: var(--fg); }
    .nav-links a[aria-current="page"] { color: var(--fg); }
    .nav-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .menu-toggle {
      min-width: 44px;
      min-height: 44px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      border-radius: 999px;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      font-size: .84rem;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .menu-toggle:hover {
      border-color: var(--fg);
      background: var(--soft);
      transform: translateY(-1px);
    }
    .mobile-menu {
      width: var(--content);
      margin: 0 auto;
      display: none;
      grid-template-columns: 1fr;
      gap: 10px;
      padding: 0 0 16px;
    }
    .mobile-menu.is-open { display: grid; }
    .mobile-link {
      min-height: 48px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-weight: 600;
    }
    .nav-action, .btn-primary, .btn-secondary {
      border: 1px solid var(--fg);
      background: var(--fg);
      color: white;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform .18s ease, background .18s ease, border-color .18s ease;
    }
    .nav-action:hover, .btn-primary:hover { transform: translateY(-1px); background: var(--accent-strong); border-color: var(--accent-strong); }
    .btn-secondary {
      background: transparent;
      color: var(--fg);
      border-color: var(--border);
    }
    .btn-secondary:hover { border-color: var(--fg); transform: translateY(-1px); }

    .hero {
      width: var(--content);
      margin: 0 auto;
      padding: clamp(52px, 9vw, 112px) 0 clamp(36px, 6vw, 78px);
      display: grid;
      gap: 42px;
    }
    .hero-banner {
      position: relative;
      min-height: clamp(280px, 38vw, 460px);
      display: grid;
      place-items: center;
      padding: clamp(28px, 5vw, 44px);
      overflow: hidden;
      border: 1px solid var(--border);
      background:
        linear-gradient(180deg, rgba(255,255,255,.1), rgba(8, 12, 24, .26)),
        var(--hero-cover-image);
      background-size: cover;
      background-position: center;
      isolation: isolate;
    }
    .hero-banner::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.28)),
        linear-gradient(120deg, rgba(255,255,255,.16), transparent 38%);
      z-index: -1;
    }
    .hero-title {
      text-align: center;
      margin: 0;
      color: white;
      font-family: var(--font-display);
      font-size: clamp(64px, 14vw, 190px);
      line-height: .86;
      font-weight: 800;
      letter-spacing: -0.025em;
      text-shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
    }
    .hero-title span {
      color: transparent;
      -webkit-text-stroke: 2px rgba(255,255,255,.95);
      text-stroke: 2px rgba(255,255,255,.95);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(280px, .75fr);
      gap: clamp(28px, 5vw, 64px);
      align-items: end;
    }
    .intro h1 {
      font-size: clamp(32px, 5vw, 64px);
      line-height: 1.02;
      margin: 0 0 18px;
      max-width: 12ch;
      color: var(--fg);
      font-weight: 700;
      letter-spacing: -0.018em;
    }
    .intro p {
      margin: 0;
      max-width: 62ch;
      color: var(--muted);
      font-size: clamp(17px, 2vw, 21px);
    }
    .author-card {
      padding: 22px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, color-mix(in oklch, var(--surface) 92%, var(--soft)), var(--surface));
      display: grid;
      gap: 16px;
    }
    .portrait {
      width: 82px;
      height: 82px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 42% 32%, oklch(86% .03 230) 0 18%, transparent 19%),
        linear-gradient(135deg, oklch(72% .055 226), oklch(42% .045 250));
      position: relative;
      overflow: hidden;
    }
    .portrait::after {
      content: "";
      position: absolute;
      left: 19px;
      right: 19px;
      bottom: 0;
      height: 38px;
      border-radius: 24px 24px 0 0;
      background: var(--fg);
    }
    .author-card h2 { margin: 0; font-size: 1.15rem; }
    .author-card p { margin: 0; color: var(--muted); font-size: .95rem; }

    .toolbar-wrap {
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .toolbar {
      width: var(--content);
      margin: 0 auto;
      padding: 18px 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: center;
    }
    .toolbar-meta {
      display: grid;
      gap: 10px;
    }
    .search {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0 16px;
      min-height: 46px;
      background: var(--bg);
    }
    .search-label {
      font-size: .76rem;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .search input {
      width: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--fg);
    }
    .result-summary {
      color: var(--muted);
      font-size: .88rem;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }
    .filter {
      min-height: 42px;
      padding: 0 14px;
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 999px;
      color: var(--muted);
    }
    .filter[aria-pressed="true"] {
      color: white;
      background: var(--fg);
      border-color: var(--fg);
    }

    .featured {
      width: var(--content);
      margin: 42px auto 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, .9fr);
      min-height: 520px;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    .visual {
      min-height: 320px;
      background:
        linear-gradient(135deg, color-mix(in oklch, var(--accent) 70%, white), oklch(30% .04 250)),
        var(--soft);
      position: relative;
      overflow: hidden;
    }
    .visual::before {
      content: "";
      position: absolute;
      inset: 11%;
      border: 1px solid rgba(255,255,255,.65);
      background:
        linear-gradient(90deg, rgba(255,255,255,.82) 0 34%, transparent 34% 40%, rgba(255,255,255,.68) 40% 100%);
      transform: rotate(-4deg);
      box-shadow: 0 28px 60px rgba(0,0,0,.2);
    }
    .visual::after {
      content: "learning path";
      position: absolute;
      left: 14%;
      bottom: 16%;
      padding: 9px 12px;
      background: var(--fg);
      color: white;
      border-radius: 999px;
      font: 700 12px/1 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .featured-copy {
      padding: clamp(28px, 5vw, 58px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 22px;
    }
    .eyebrow {
      color: var(--accent-strong);
      font: 700 .74rem/1 var(--font-mono);
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .featured h2 {
      margin: 0;
      font-size: clamp(34px, 5vw, 68px);
      line-height: 1.02;
      letter-spacing: -0.018em;
      max-width: 10ch;
    }
    .featured p { margin: 0; color: var(--muted); font-size: 1.03rem; }

    .posts {
      margin-top: 54px;
      border-top: 1px solid var(--border);
    }
    .post-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      min-height: 430px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .post-row.is-dark {
      background: var(--dark);
      color: white;
    }
    .post-row.is-dark .post-meta,
    .post-row.is-dark .post-excerpt,
    .post-row.is-dark .author-line { color: var(--dark-muted); }
    .post-row.is-dark .open-post { color: white; border-color: rgba(255,255,255,.28); }
    .post-row:nth-child(even) .post-media { order: 2; }
    .post-media {
      min-height: 430px;
      background: var(--soft);
      position: relative;
      overflow: hidden;
    }
    .post-media-frame,
    .dialog-media-card {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      background: color-mix(in oklch, var(--dark) 86%, black);
    }
    .post-media-frame img,
    .post-media-frame video,
    .dialog-media-card img,
    .dialog-media-card video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }
    .post-media-frame video,
    .dialog-media-card video {
      background: color-mix(in oklch, var(--dark) 90%, black);
    }
    .post-media-stack {
      position: absolute;
      inset: auto 22px 22px 22px;
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 16px;
      z-index: 2;
    }
    .post-media-stack p {
      margin: 0;
      max-width: 24ch;
      color: white;
      font-size: .95rem;
      text-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .post-media[data-kind="Article"] {
      background:
        linear-gradient(90deg, transparent 0 18%, rgba(255,255,255,.75) 18% 20%, transparent 20%),
        linear-gradient(135deg, oklch(93% .012 245), oklch(77% .03 226));
    }
    .post-media[data-kind="Pictures"] {
      background:
        radial-gradient(circle at 70% 28%, oklch(82% .06 185) 0 16%, transparent 17%),
        linear-gradient(135deg, oklch(88% .02 228), oklch(64% .07 230));
    }
    .post-media[data-kind="Video"] {
      background:
        radial-gradient(circle at 50% 50%, rgba(255,255,255,.86) 0 8%, transparent 9%),
        conic-gradient(from 130deg at 50% 50%, oklch(72% .08 230), oklch(32% .035 248), oklch(72% .08 230));
    }
    .post-media[data-kind="Mixed"] {
      background:
        linear-gradient(45deg, rgba(255,255,255,.7) 0 12%, transparent 12% 24%, rgba(255,255,255,.45) 24% 36%, transparent 36%),
        linear-gradient(135deg, oklch(84% .035 205), oklch(44% .05 250));
    }
    .media-badge {
      position: absolute;
      top: 28px;
      left: 28px;
      background: rgba(255,255,255,.88);
      color: var(--fg);
      padding: 8px 12px;
      border-radius: 999px;
      font: 700 .74rem/1 var(--font-mono);
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .post-content {
      padding: clamp(28px, 5vw, 64px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
    }
    .post-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      color: var(--muted);
      font-size: .82rem;
    }
    .post-title {
      margin: 0;
      font-size: clamp(28px, 4vw, 52px);
      line-height: 1.06;
      max-width: 14ch;
    }
    .post-excerpt {
      margin: 0;
      color: var(--muted);
      max-width: 58ch;
    }
    .author-line {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--muted);
      font-size: .9rem;
    }
    .mini-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), oklch(35% .04 250));
    }
    .open-post {
      align-self: flex-start;
      min-height: 44px;
      padding: 0 15px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: transparent;
      color: var(--fg);
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .open-post:hover { border-color: currentColor; transform: translateY(-1px); }
    .post-row.is-new {
      animation: new-post-flash 1.2s ease;
    }
    @keyframes new-post-flash {
      0% { background: color-mix(in oklch, var(--accent) 16%, var(--surface)); }
      100% { background: transparent; }
    }

    .creator {
      width: var(--content);
      margin: clamp(50px, 8vw, 88px) auto;
      display: grid;
      grid-template-columns: minmax(0, .8fr) minmax(320px, 1fr);
      gap: 34px;
      align-items: start;
    }
    .creator h2, .contact h2 {
      margin: 0 0 14px;
      font-size: clamp(30px, 5vw, 56px);
      line-height: 1.05;
      letter-spacing: -0.018em;
    }
    .creator p, .contact p { color: var(--muted); margin: 0; }
    .composer {
      border: 1px solid var(--border);
      background: var(--surface);
      padding: clamp(22px, 4vw, 34px);
      display: grid;
      gap: 16px;
    }
    .field { display: grid; gap: 7px; }
    .field label {
      font-size: .78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--muted);
    }
    .field input, .field textarea, .field select {
      width: 100%;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--fg);
      border-radius: var(--radius);
      padding: 12px 13px;
      min-height: 44px;
      outline: 0;
    }
    .field textarea { min-height: 112px; resize: vertical; }
    .field input:focus, .field textarea:focus, .field select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px color-mix(in oklch, var(--accent) 18%, transparent);
    }
    .field input[aria-invalid="true"], .field textarea[aria-invalid="true"] {
      border-color: var(--danger);
      box-shadow: 0 0 0 4px color-mix(in oklch, var(--danger) 14%, transparent);
    }
    .field input[type="file"] {
      padding: 12px;
      background: var(--surface);
    }
    .field small {
      color: var(--muted);
      font-size: .84rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .attachment-preview {
      display: grid;
      gap: 10px;
      padding: 14px;
      border: 1px dashed var(--border);
      background: color-mix(in oklch, var(--soft) 72%, white);
      min-height: 64px;
      align-content: start;
    }
    .attachment-preview.is-empty {
      color: var(--muted);
      font-size: .9rem;
    }
    .attachment-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 10px 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: var(--radius);
    }
    .attachment-item strong {
      display: block;
      font-size: .95rem;
    }
    .attachment-item span {
      display: block;
      color: var(--muted);
      font-size: .82rem;
    }
    .attachment-tag,
    .post-media-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: var(--fg);
      color: white;
      font: 700 .72rem/1 var(--font-mono);
      letter-spacing: .08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .message {
      min-height: 20px;
      color: var(--success);
      font-size: .9rem;
    }

    .contact {
      background: var(--dark);
      color: white;
      padding: clamp(52px, 8vw, 92px) 0;
    }
    .contact-inner {
      width: var(--content);
      margin: 0 auto;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, .65fr);
      gap: 40px;
      align-items: center;
    }
    .contact p { color: var(--dark-muted); max-width: 62ch; }
    .contact-links {
      display: grid;
      gap: 12px;
    }
    .contact-links a, .contact-links span {
      border-bottom: 1px solid rgba(255,255,255,.18);
      padding: 12px 0;
      color: white;
    }
    .contact-links span { color: var(--dark-muted); }

    .dialog {
      position: fixed;
      inset: 0;
      background: rgba(8, 11, 16, .62);
      display: none;
      place-items: center;
      z-index: 60;
      padding: 22px;
    }
    .dialog.is-open { display: grid; }
    .dialog-panel {
      width: min(720px, 100%);
      max-height: min(780px, 90vh);
      overflow: auto;
      background: var(--surface);
      color: var(--fg);
      border-radius: 10px;
      border: 1px solid var(--border);
      box-shadow: 0 24px 80px rgba(0,0,0,.28);
    }
    .dialog-head {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      padding: 24px 26px;
      border-bottom: 1px solid var(--border);
    }
    .dialog-head h3 { margin: 0; font-size: 1.5rem; }
    .close {
      width: 44px;
      height: 44px;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: transparent;
      font-size: 1.3rem;
    }
    .close:hover { border-color: var(--fg); background: var(--soft); }
    .dialog-body { padding: 24px 26px 30px; }
    .dialog-body p { color: var(--muted); }
    .embed-box {
      aspect-ratio: 16/9;
      background:
        radial-gradient(circle at center, white 0 9%, transparent 10%),
        linear-gradient(135deg, var(--accent), var(--dark));
      display: grid;
      place-items: end start;
      padding: 22px;
      color: white;
      margin: 20px 0;
    }
    .embed-box.has-media {
      aspect-ratio: auto;
      background: transparent;
      padding: 0;
      display: block;
    }
    .dialog-media-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .dialog-media-card {
      aspect-ratio: 16/10;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .dialog-media-link {
      display: inline-flex;
      margin-top: 12px;
      color: var(--accent-strong);
      font-weight: 700;
    }

    .empty {
      padding: 54px 20px;
      text-align: center;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }
    .empty strong {
      display: block;
      color: var(--fg);
      font-size: clamp(22px, 4vw, 34px);
      line-height: 1.1;
      letter-spacing: -0.018em;
      margin-bottom: 10px;
    }
    .empty button { margin-top: 18px; }

    @media (max-width: 860px) {
      .nav-inner { min-height: auto; padding: 16px 0; align-items: center; }
      .nav-links { display: none; }
      .menu-toggle { display: inline-flex; }
      .hero-grid, .featured, .creator, .contact-inner { grid-template-columns: 1fr; }
      .toolbar { grid-template-columns: 1fr; }
      .filters { justify-content: flex-start; }
      .post-row { grid-template-columns: 1fr; }
      .post-row:nth-child(even) .post-media { order: 0; }
      .post-media { min-height: 270px; }
      .featured h2, .post-title { max-width: none; }
      .form-grid { grid-template-columns: 1fr; }
      .post-media-stack {
        inset: auto 16px 16px 16px;
        flex-direction: column;
        align-items: start;
      }
    }

    @media (max-width: 520px) {
      :root { --content: min(100vw - 24px, 1160px); }
      .hero-title { font-size: clamp(58px, 22vw, 94px); }
      .hero-title span { -webkit-text-stroke-width: 1px; text-stroke-width: 1px; }
      .nav-controls { width: 100%; justify-content: space-between; }
      .menu-toggle { padding: 0 14px; }
      .nav-action { padding: 0 13px; }
      .featured-copy, .post-content { padding: 24px; }
      .creator { margin: 42px auto; }
      .filter { flex: 1 1 auto; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .001ms !important;
      }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#posts">Skip to posts</a>
  <nav class="site-nav" aria-label="Primary navigation">
    <div class="nav-inner">
      <a href="#home" class="brand" aria-label="Gary's Design home"><span class="brand-mark"></span> Gary's Design</a>
      <div class="nav-links">
        <a href="#posts" aria-current="page">Posts</a>
        <a href="#create">Create</a>
        <a href="#contact">Contact</a>
      </div>
      <div class="nav-controls">
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobileMenu" data-menu-toggle>Menu</button>
        <button class="nav-action" type="button" data-jump-create>New post</button>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <a class="mobile-link" href="#posts">Posts</a>
      <a class="mobile-link" href="#create">Create</a>
      <a class="mobile-link" href="#contact">Contact</a>
    </div>
  </nav>

  <main id="home">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-banner" aria-label="Cover image behind Gary's Design title">
        <h1 class="hero-title" id="hero-title">Gary's <span>Design</span></h1>
      </div>
      <div class="hero-grid">
        <div class="intro">
          <h1>Instructional design work, written and shown.</h1>
          <p>A simple publishing home for learning articles, process images, demo videos, and complete case-study posts. Built so each new piece can stand alone as evidence of design thinking, content craft, and learner-centered execution.</p>
        </div>
        <aside class="author-card" aria-label="Author profile">
          <div class="portrait" aria-hidden="true"></div>
          <div>
            <h2>Instructional Designer</h2>
            <p>Use this space for your name, specialty, and a two-line statement about the learning problems you solve.</p>
          </div>
        </aside>
      </div>
    </section>

    <section class="toolbar-wrap" aria-label="Post filters">
      <div class="toolbar">
        <div class="toolbar-meta">
          <label class="search" for="searchInput">
            <span class="search-label">Search</span>
            <input id="searchInput" type="search" placeholder="Find by topic, format, or audience" autocomplete="off" />
          </label>
          <div class="result-summary" id="resultSummary" aria-live="polite">Showing all portfolio entries.</div>
        </div>
        <div class="filters" id="filters" aria-label="Filter by format">
          <button class="filter" type="button" data-filter="All" aria-pressed="true">All</button>
          <button class="filter" type="button" data-filter="Article" aria-pressed="false">Articles</button>
          <button class="filter" type="button" data-filter="Pictures" aria-pressed="false">Pictures</button>
          <button class="filter" type="button" data-filter="Video" aria-pressed="false">Videos</button>
          <button class="filter" type="button" data-filter="Mixed" aria-pressed="false">Mixed</button>
        </div>
      </div>
    </section>

    <section class="featured" aria-labelledby="featured-title">
      <div class="visual" aria-hidden="true"></div>
      <div class="featured-copy">
        <div class="eyebrow">Featured case study</div>
        <h2 id="featured-title">From course notes to learner pathway.</h2>
        <p>Lead with a strong piece that combines article writing, screenshots, and a short walkthrough video. The layout keeps the Moose-style split composition while making the content clearly instructional-design focused.</p>
        <button class="btn-secondary" type="button" data-open-featured>Read featured post</button>
      </div>
    </section>

    <section class="posts" id="posts" aria-live="polite"></section>

    <section class="creator" id="create" aria-labelledby="create-title">
      <div>
        <div class="eyebrow">Content studio</div>
        <h2 id="create-title">Create the next portfolio post.</h2>
        <p>Add a written article, image-based process note, video walkthrough, or a mixed-media case study. Keep each entry focused on the learning problem, the design decision, and the evidence you want reviewers to see.</p>
      </div>
      <form class="composer" id="postForm">
        <div class="field">
          <label for="postTitle">Title</label>
          <input id="postTitle" name="title" placeholder="e.g. Building a scenario-based onboarding module" required aria-describedby="formMessage" aria-invalid="false" />
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="postKind">Format</label>
            <select id="postKind" name="kind">
              <option>Article</option>
              <option>Pictures</option>
              <option>Video</option>
              <option>Mixed</option>
            </select>
          </div>
          <div class="field">
            <label for="postAudience">Audience</label>
            <input id="postAudience" name="audience" placeholder="New hires, sales team, students" />
          </div>
        </div>
        <div class="field">
          <label for="postSummary">Summary</label>
          <textarea id="postSummary" name="summary" placeholder="Describe the learning problem, your design approach, and what the viewer should notice." required aria-describedby="formMessage" aria-invalid="false"></textarea>
        </div>
        <div class="field">
          <label for="postMedia">Supporting media link or note</label>
          <input id="postMedia" name="media" placeholder="Optional URL, caption, or context for the attached media" />
        </div>
        <div class="field">
          <label for="postFiles">Attach images or videos</label>
          <input id="postFiles" name="files" type="file" accept="image/*,video/*" multiple aria-describedby="attachmentHelp formMessage" aria-invalid="false" />
          <small id="attachmentHelp">Add screenshots, photos, or short clips directly to the post. This prototype saves them in your browser, so compressed files work best.</small>
          <div class="attachment-preview is-empty" id="attachmentPreview">No files selected yet.</div>
        </div>
        <div class="message" id="formMessage" role="status" aria-live="polite"></div>
        <button class="btn-primary" type="submit" id="publishButton">Publish post</button>
      </form>
    </section>
  </main>

  <footer class="contact" id="contact">
    <div class="contact-inner">
      <div>
        <div class="eyebrow">Contact</div>
        <h2>Invite the work into a conversation.</h2>
        <p>Use this footer for your email, resume, LinkedIn, and a short note about the kinds of learning design projects you want to take on next.</p>
      </div>
      <div class="contact-links">
        <a href="mailto:hello@example.com">hello@example.com</a>
        <span>LinkedIn profile URL</span>
        <span>Resume PDF link</span>
      </div>
    </div>
  </footer>

  <div class="dialog" id="postDialog" role="dialog" aria-modal="true" aria-labelledby="dialogTitle">
    <article class="dialog-panel">
      <div class="dialog-head">
        <h3 id="dialogTitle">Post title</h3>
        <button class="close" type="button" aria-label="Close dialog" data-close-dialog>&times;</button>
      </div>
      <div class="dialog-body" id="dialogBody"></div>
    </article>
  </div>

  <script>
    const seedPosts = [
      {
        title: 'Designing a microlearning series for busy managers',
        kind: 'Article',
        audience: 'Team leads',
        date: 'Draft post',
        summary: 'A written breakdown of how short lessons, spaced prompts, and manager reflection questions can turn a policy topic into a practical coaching routine.',
        media: 'Article outline and lesson structure'
      },
      {
        title: 'Storyboard frames for a customer-service simulation',
        kind: 'Pictures',
        audience: 'Frontline support',
        date: 'Draft post',
        summary: 'A visual process post showing scenario beats, feedback moments, and interface states for a branching practice activity.',
        media: 'Storyboard screenshots'
      },
      {
        title: 'Video walkthrough: from learning objective to prototype',
        kind: 'Video',
        audience: 'Portfolio reviewers',
        date: 'Draft post',
        summary: 'A short narrated walkthrough slot for explaining the decisions behind an instructional prototype without making the viewer read the whole case study first.',
        media: 'Video embed placeholder'
      },
      {
        title: 'Complete case study: blended onboarding path',
        kind: 'Mixed',
        audience: 'Hiring managers',
        date: 'Draft post',
        summary: 'A combined article, image gallery, and video reflection that documents the problem, design constraints, sample deliverables, and what changed after review.',
        media: 'Article + images + video'
      }
    ];

    const storageKey = 'instructional-portfolio-posts';
    const postsEl = document.getElementById('posts');
    const searchInput = document.getElementById('searchInput');
    const filtersEl = document.getElementById('filters');
    const resultSummary = document.getElementById('resultSummary');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const dialog = document.getElementById('postDialog');
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogBody = document.getElementById('dialogBody');
    const form = document.getElementById('postForm');
    const formMessage = document.getElementById('formMessage');
    const publishButton = document.getElementById('publishButton');
    const titleInput = document.getElementById('postTitle');
    const summaryInput = document.getElementById('postSummary');
    const filesInput = document.getElementById('postFiles');
    const attachmentPreview = document.getElementById('attachmentPreview');
    let activeFilter = 'All';
    let lastFocusedElement = null;
    let latestPublishedPostId = null;
    const maxAttachmentCount = 6;
    const maxAttachmentBytes = 3 * 1024 * 1024;

    function normalizeAttachments(attachments) {
      return Array.isArray(attachments)
        ? attachments.filter(item => item && item.src && item.kind && item.name)
        : [];
    }

    function normalizePost(post) {
      return {
        ...post,
        id: post.id || ``post-`$`{Date.now()}-`$`{Math.random().toString(36).slice(2, 8)}``,
        media: post.media || '',
        attachments: normalizeAttachments(post.attachments)
      };
    }

    function loadPosts() {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return Array.isArray(saved) && saved.length ? saved.map(normalizePost) : seedPosts.map(normalizePost);
      } catch (_) {
        formMessage.style.color = 'var(--warn)';
        formMessage.textContent = 'Saved posts could not be loaded. The starter posts are showing instead.';
        return seedPosts.map(normalizePost);
      }
    }

    function savePosts(posts) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(posts.map(normalizePost)));
        return true;
      } catch (_) {
        return false;
      }
    }

    let posts = loadPosts();

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[char]));
    }

    function escapeAttribute(value) {
      return escapeHtml(value).replace(/``/g, '&#96;');
    }

    function formatBytes(bytes) {
      if (!bytes) return '0 KB';
      if (bytes >= 1024 * 1024) return ```$`{(bytes / (1024 * 1024)).toFixed(1)} MB``;
      return ```$`{Math.max(1, Math.round(bytes / 1024))} KB``;
    }

    function attachmentKindLabel(kind) {
      return kind === 'video' ? 'Video' : 'Image';
    }

    function getAttachmentSummary(post) {
      const attachments = normalizeAttachments(post.attachments);
      if (!attachments.length) return post.media || 'Media note open';
      const label = ```$`{attachments.length} `$`{attachments.length === 1 ? 'attachment' : 'attachments'}``;
      return post.media ? ```$`{label} + note`` : label;
    }

    function renderAttachmentPreviewList(files) {
      if (!files.length) {
        attachmentPreview.classList.add('is-empty');
        attachmentPreview.textContent = 'No files selected yet.';
        return;
      }
      attachmentPreview.classList.remove('is-empty');
      attachmentPreview.innerHTML = files.map(file => {
        const kind = file.type.startsWith('video/') ? 'Video' : 'Image';
        return ``
          <div class="attachment-item">
            <div>
              <strong>`$`{escapeHtml(file.name)}</strong>
              <span>`$`{kind} - `$`{formatBytes(file.size)}</span>
            </div>
            <span class="attachment-tag">`$`{kind}</span>
          </div>
        ``;
      }).join('');
    }

    function renderMediaAsset(attachment, className) {
      if (!attachment) return '';
      if (attachment.kind === 'video') {
        return ``<video class="`$`{className}" src="`$`{escapeAttribute(attachment.src)}" controls preload="metadata"></video>``;
      }
      return ``<img class="`$`{className}" src="`$`{escapeAttribute(attachment.src)}" alt="`$`{escapeAttribute(attachment.name)}" />``;
    }

    function renderCardMedia(post) {
      const attachments = normalizeAttachments(post.attachments);
      if (!attachments.length) return ``<span class="media-badge">`$`{escapeHtml(post.kind)}</span>``;
      const first = attachments[0];
      return ``
        <span class="media-badge">`$`{escapeHtml(post.kind)}</span>
        <div class="post-media-frame">
          `$`{renderMediaAsset(first, 'post-media-asset')}
        </div>
        <div class="post-media-stack">
          <p>`$`{escapeHtml(first.name)}</p>
          `$`{attachments.length > 1 ? ``<span class="post-media-count">+`$`{attachments.length - 1} more</span>`` : ``<span class="attachment-tag">`$`{escapeHtml(attachmentKindLabel(first.kind))}</span>``}
        </div>
      ``;
    }

    function renderDialogMedia(post) {
      const attachments = normalizeAttachments(post.attachments);
      if (attachments.length) {
        const linkMarkup = post.media && /^https?:\/\//i.test(post.media)
          ? ``<a class="dialog-media-link" href="`$`{escapeAttribute(post.media)}" target="_blank" rel="noreferrer">`$`{escapeHtml(post.media)}</a>``
          : (post.media ? ``<p>`$`{escapeHtml(post.media)}</p>`` : '');
        return ``
          <div class="embed-box has-media">
            <div class="dialog-media-grid">
              `$`{attachments.map(attachment => ``
                <div class="dialog-media-card">
                  `$`{renderMediaAsset(attachment, 'dialog-media-asset')}
                </div>
              ``).join('')}
            </div>
            `$`{linkMarkup}
          </div>
        ``;
      }
      if (post.media && /^https?:\/\//i.test(post.media)) {
        return ``
          <div class="embed-box">
            <strong>Open linked media</strong>
            <a class="dialog-media-link" href="`$`{escapeAttribute(post.media)}" target="_blank" rel="noreferrer">`$`{escapeHtml(post.media)}</a>
          </div>
        ``;
      }
      return ``<div class="embed-box"><strong>`$`{escapeHtml(post.media || 'Media placeholder')}</strong></div>``;
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          kind: file.type.startsWith('video/') ? 'video' : 'image',
          src: reader.result
        });
        reader.onerror = () => reject(new Error(``Could not read `$`{file.name}.``));
        reader.readAsDataURL(file);
      });
    }

    async function readAttachments(files) {
      return Promise.all(files.map(readFileAsDataUrl));
    }

    function matches(post) {
      const query = searchInput.value.trim().toLowerCase();
      const haystack = [
        post.title,
        post.kind,
        post.audience,
        post.summary,
        post.media,
        ...normalizeAttachments(post.attachments).map(item => item.name)
      ].join(' ').toLowerCase();
      const kindMatch = activeFilter === 'All' || post.kind === activeFilter;
      return kindMatch && (!query || haystack.includes(query));
    }

    function renderPosts() {
      const visible = posts.filter(matches);
      const query = searchInput.value.trim();
      const filterLabel = activeFilter === 'All' ? 'all formats' : activeFilter.toLowerCase();
      resultSummary.textContent = visible.length
        ? ``Showing `$`{visible.length} `$`{visible.length === 1 ? 'entry' : 'entries'} for `$`{filterLabel}`$`{query ? `` matching "`$`{query}"`` : ''}.``
        : ``No entries found for `$`{filterLabel}`$`{query ? `` matching "`$`{query}"`` : ''}.``;
      postsEl.innerHTML = visible.length ? visible.map((post, index) => ``
        <article class="post-row `$`{index % 2 ? 'is-dark' : ''} `$`{post.id === latestPublishedPostId ? 'is-new' : ''}" data-kind="`$`{escapeHtml(post.kind)}" data-post-id="`$`{escapeHtml(post.id)}">
          <div class="post-media" data-kind="`$`{escapeHtml(post.kind)}">
            `$`{renderCardMedia(post)}
          </div>
          <div class="post-content">
            <div class="post-meta">
              <span>`$`{escapeHtml(post.date || 'Draft post')}</span>
              <span>`$`{escapeHtml(post.audience || 'Audience to define')}</span>
              <span>`$`{escapeHtml(getAttachmentSummary(post))}</span>
            </div>
            <h2 class="post-title">`$`{escapeHtml(post.title)}</h2>
            <p class="post-excerpt">`$`{escapeHtml(post.summary)}</p>
            <div class="author-line"><span class="mini-avatar" aria-hidden="true"></span><span>Instructional design portfolio entry</span></div>
            <button class="open-post" type="button" data-post-index="`$`{posts.indexOf(post)}">Open post</button>
          </div>
        </article>
      ``).join('') : ``
        <div class="empty">
          <strong>No matching posts yet.</strong>
          <span>Clear the search or publish a new piece in this format.</span>
          <button class="btn-secondary" type="button" data-clear-filters>Show all posts</button>
        </div>
      ``;
    }

    function openPost(post) {
      lastFocusedElement = document.activeElement;
      dialogTitle.textContent = post.title;
      dialogBody.innerHTML = ``
        <div class="eyebrow">`$`{escapeHtml(post.kind)} / `$`{escapeHtml(post.audience || 'Audience to define')}</div>
        `$`{renderDialogMedia(post)}
        <p>`$`{escapeHtml(post.summary)}</p>
        <p><strong>Portfolio note:</strong> Use this body for the full article, image gallery, embedded video, or combined case-study narrative behind the work.</p>
      ``;
      dialog.classList.add('is-open');
      document.body.classList.add('modal-open');
      dialog.querySelector('[data-close-dialog]').focus();
    }

    function closeDialog() {
      dialog.classList.remove('is-open');
      document.body.classList.remove('modal-open');
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus({ preventScroll: true });
      }
    }

    function keepFocusInDialog(event) {
      const focusable = dialog.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
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

    function setFormError(message, field) {
      formMessage.style.color = 'var(--danger)';
      formMessage.textContent = message;
      [titleInput, summaryInput, filesInput].forEach(input => input.setAttribute('aria-invalid', 'false'));
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    }

    function clearFormErrors() {
      [titleInput, summaryInput, filesInput].forEach(input => input.setAttribute('aria-invalid', 'false'));
    }

    function closeMobileMenu() {
      mobileMenu.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    function toggleMobileMenu() {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    }

    filtersEl.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter;
      filtersEl.querySelectorAll('.filter').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      renderPosts();
    });

    searchInput.addEventListener('input', renderPosts);

    postsEl.addEventListener('click', event => {
      const clearButton = event.target.closest('[data-clear-filters]');
      if (clearButton) {
        activeFilter = 'All';
        searchInput.value = '';
        filtersEl.querySelectorAll('.filter').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === 'All')));
        renderPosts();
        searchInput.focus();
        return;
      }
      const button = event.target.closest('[data-post-index]');
      if (!button) return;
      openPost(posts[Number(button.dataset.postIndex)]);
    });

    document.querySelector('[data-open-featured]').addEventListener('click', () => {
      openPost({
        title: 'From course notes to learner pathway',
        kind: 'Mixed',
        audience: 'Portfolio reviewers',
        summary: 'A featured case-study slot for combining the article, screenshots, and a brief walkthrough video behind a complete instructional design project.',
        media: 'Featured article + gallery + video'
      });
    });

    filesInput.addEventListener('change', () => {
      renderAttachmentPreviewList(Array.from(filesInput.files || []));
    });

    document.querySelectorAll('[data-close-dialog]').forEach(button => {
      button.addEventListener('click', closeDialog);
    });

    dialog.addEventListener('click', event => {
      if (event.target === dialog) closeDialog();
    });

    document.addEventListener('keydown', event => {
      if (!dialog.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeDialog();
      if (event.key === 'Tab') keepFocusInDialog(event);
    });

    function jumpToSection(id) {
      const target = document.getElementById(id);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.pageYOffset - 78;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    }

    function focusPublishedPost(postId) {
      if (!postId) return;
      const target = postsEl.querySelector(``[data-post-id="`$`{postId}"]``);
      if (!target) return;
      window.setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 108;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      }, 80);
    }

    document.querySelector('[data-jump-create]').addEventListener('click', () => {
      closeMobileMenu();
      jumpToSection('create');
      window.setTimeout(() => document.getElementById('postTitle').focus({ preventScroll: true }), 320);
    });

    menuToggle.addEventListener('click', toggleMobileMenu);

    mobileMenu.addEventListener('click', event => {
      if (event.target.closest('a[href]')) closeMobileMenu();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(form);
      const selectedFiles = Array.from(filesInput.files || []);
      const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const post = {
        id: ``post-`$`{Date.now()}``,
        title: formData.get('title').trim(),
        kind: formData.get('kind'),
        audience: formData.get('audience').trim(),
        summary: formData.get('summary').trim(),
        media: formData.get('media').trim(),
        attachments: [],
        date: 'New post'
      };
      clearFormErrors();
      if (!post.title) {
        setFormError('Add a title before publishing.', titleInput);
        return;
      }
      if (!post.summary) {
        setFormError('Add a summary before publishing.', summaryInput);
        return;
      }
      if (selectedFiles.length > maxAttachmentCount) {
        setFormError(``Attach up to `$`{maxAttachmentCount} files per post.``, filesInput);
        return;
      }
      if (totalBytes > maxAttachmentBytes) {
        setFormError('Attached files are too large for the local prototype. Use compressed images or shorter clips under 3 MB total.', filesInput);
        return;
      }
      publishButton.disabled = true;
      publishButton.textContent = 'Publishing...';
      try {
        post.attachments = await readAttachments(selectedFiles);
      } catch (error) {
        setFormError(error.message || 'One or more files could not be attached.', filesInput);
        publishButton.disabled = false;
        publishButton.textContent = 'Publish post';
        return;
      }
      posts = [post, ...posts];
      if (!savePosts(posts)) {
        posts = posts.slice(1);
        setFormError('This browser could not save the post. Try smaller files or clear browser storage space, then publish again.', null);
        publishButton.disabled = false;
        publishButton.textContent = 'Publish post';
        return;
      }
      form.reset();
      renderAttachmentPreviewList([]);
      formMessage.style.color = 'var(--success)';
      formMessage.textContent = post.attachments.length
        ? 'Published to the top of your portfolio feed and opened as a preview with attached media.'
        : 'Published to the top of your portfolio feed and opened as a preview.';
      publishButton.disabled = false;
      publishButton.textContent = 'Publish post';
      activeFilter = 'All';
      searchInput.value = '';
      latestPublishedPostId = post.id;
      filtersEl.querySelectorAll('.filter').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === 'All')));
      renderPosts();
      focusPublishedPost(post.id);
      openPost(post);
      window.setTimeout(() => {
        latestPublishedPostId = null;
        renderPosts();
      }, 1400);
    });

    renderAttachmentPreviewList([]);
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMobileMenu();
    });

    renderPosts();
  </script>
</body>
</html>

`;

const headers = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', {
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }
    return new Response(html, { headers });
  }
};

# CMS Setup

This project now contains a real CMS application layer, but the live site cannot use it until runtime secrets and Supabase are configured.

## Required runtime secrets

Set these in the site's production environment before deploying the CMS build:

- `SUPABASE_URL`
  - Base Supabase project URL.
  - Used by the worker API for content reads, post CRUD, and uploads.
- `SUPABASE_SERVICE_ROLE_KEY`
  - Supabase service-role key.
  - Required because the worker writes site content, posts, and uploaded media.
- `CMS_SESSION_SECRET`
  - Long random secret for signing the host login session cookie.
  - Without this, authenticated studio access is disabled.

## Optional runtime secrets

- `CMS_HOST_PASSWORD`
  - Initial host login password for the studio.
  - If omitted, the login bootstrap path has no initial password source.
- `SUPABASE_STORAGE_BUCKET`
  - Storage bucket name for uploaded images and videos.
  - Defaults to `portfolio-assets` if not set.

## External setup still needed

### 1. Create or confirm the Supabase project

You need one Supabase project for:

- persistent page settings
- persistent published posts
- uploaded cover images, profile images, and post media

### 2. Run the schema

Run [`supabase/schema.sql`](C:/Users/garyy/AppData/Roaming/Open%20Design/namespaces/release-stable-win/data/projects/7c7596c0-a411-4af9-981f-9164131eaa30/supabase/schema.sql) in the Supabase SQL editor.

This creates:

- `public.site_content`
- `public.posts`
- update triggers for `updated_at`
- one starter `site_content` row with slug `main`

### 3. Create the storage bucket

Create a Supabase Storage bucket named:

- `portfolio-assets`

Or set `SUPABASE_STORAGE_BUCKET` to a different bucket name and create that instead.

The bucket must allow the worker to upload and read files through the service-role key.

### 4. Collect the runtime values

From Supabase, copy:

- project URL -> `SUPABASE_URL`
- service-role key -> `SUPABASE_SERVICE_ROLE_KEY`

Generate one strong random string for:

- `CMS_SESSION_SECRET`

Decide the initial studio password for:

- `CMS_HOST_PASSWORD`

### 5. Add secrets to the site runtime

Configure the production environment for the published site with:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CMS_SESSION_SECRET`
- optionally `CMS_HOST_PASSWORD`
- optionally `SUPABASE_STORAGE_BUCKET`

## Where the code expects these values

- [`server/worker.template.js`](C:/Users/garyy/AppData/Roaming/Open%20Design/namespaces/release-stable-win/data/projects/7c7596c0-a411-4af9-981f-9164131eaa30/server/worker.template.js)
  - reads all CMS runtime secrets
  - handles authenticated studio routes and API requests
  - talks to Supabase for content and uploads
- [`scripts/build-site-package.ps1`](C:/Users/garyy/AppData/Roaming/Open%20Design/namespaces/release-stable-win/data/projects/7c7596c0-a411-4af9-981f-9164131eaa30/scripts/build-site-package.ps1)
  - packages the worker and static routes for deployment
- [`assets/portfolio-app.js`](C:/Users/garyy/AppData/Roaming/Open%20Design/namespaces/release-stable-win/data/projects/7c7596c0-a411-4af9-981f-9164131eaa30/assets/portfolio-app.js)
  - uses the API exposed by the worker instead of browser-local storage

## After secrets are configured

The remaining sequence is:

1. rebuild the site package
2. deploy the updated CMS build
3. open `/studio.html`
4. log in as host
5. verify:
   - create post
   - edit post
   - delete post
   - edit page copy
   - change cover image and profile image
   - viewer page reflects persisted changes

## Important current limitation until deployment

Until those runtime secrets are configured and the CMS build is deployed, the live site remains on the previously published static build rather than the real authenticated backend/CMS version.

# Visual Asset Plan for Gary's Design

## Aesthetic goal

Build one coherent editorial image system for the existing Moose-inspired portfolio:

- quiet, clean, image-led
- bright paper-like backgrounds with charcoal contrast
- muted blue accent only
- instructional-design subject matter, not generic startup visuals
- real working scenes, annotated materials, screens, notebooks, workshop tables, learner artifacts

## What image is actually missing

The highest-priority missing asset is not icons or illustration. It is a **cohesive editorial image set** that makes the homepage feel like Gary's real body of work instead of a polished wireframe.

Priority order:

1. hero cover image behind `Gary's Design`
2. featured-case visual for the split section
3. starter post cover images so the feed stops relying on abstract gradients
4. social share image
5. small icon set only if needed later

## Constraints to keep all assets in one brand world

- avoid purple/blue AI glow, dashboards, blobs, and fake KPI screens
- prefer photography or photo-real composites over illustration
- keep backgrounds bright or charcoal, never beige-pink creator gradients
- show instructional-design artifacts: storyboards, workshop notes, curriculum maps, LMS screens, learner journey boards, assessment drafts
- use negative space so the HTML layout still feels premium once images are dropped in
- color grade consistently: cool daylight neutrals, paper white, graphite, muted steel blue

## File plan

Store these in `assets/portfolio/`.

### 1. Hero cover

- File: `assets/portfolio/hero-cover.jpg`
- Aspect: `16:9`
- Placement: CSS variable `--hero-cover-image` in `instructional-design-portfolio.html`
- Job: opening scene behind the `Gary's Design` title

Prompt:

`Editorial website hero background for an instructional designer portfolio, clean modern workspace seen from slightly above, printed learning maps, storyboard cards, notebook spreads, laptop with wireframe lesson screens, camera-ready composition with a strong empty center safe area for large white title text, bright natural light, paper white and graphite palette with muted steel-blue accents, premium magazine art direction, realistic photography, no people looking at camera, no purple glow, no fake startup dashboard, no visible brand logos`

### 2. Featured case-study visual

- File: `assets/portfolio/featured-case-study.jpg`
- Aspect: `4:5`
- Placement: replace the generated `.visual` block in the featured section
- Job: support the lead post about mixed-media instructional design work

Prompt:

`Premium editorial case-study image for instructional design portfolio, layered learning design artifacts pinned on a wall and desk, scenario map, UI screenshots, feedback notes, lesson outline, one tablet showing a clean training module screen, tactile paper-and-screen contrast, strong composition for a split-layout website section, cool white, charcoal, and muted blue palette, realistic high-end photography, crisp detail, restrained and implementation-friendly`

### 3. Article post cover

- File: `assets/portfolio/post-article-cover.jpg`
- Aspect: `16:10`
- Placement: attach to the first long-form article post
- Job: represent writing-led work with visual credibility

Prompt:

`Editorial cover image for a learning design article, close view of annotated manuscript pages, curriculum outline, pen marks, sticky notes, and a laptop showing a text-first lesson draft, premium publishing aesthetic, soft daylight, controlled shadows, white and charcoal with one muted blue object, realistic photography, spacious composition, no staged corporate people`

### 4. Process gallery post cover

- File: `assets/portfolio/post-process-gallery.jpg`
- Aspect: `16:10`
- Placement: attach to the picture-based process post
- Job: show iteration and visual process

Prompt:

`Design process gallery cover for instructional designer portfolio, tabletop spread of wireframes, storyboard tiles, learner journey sketches, screen printouts, colored markers, tidy but lived-in process scene, editorial top-down composition, premium magazine photography, cool neutral palette with subtle blue accents, strong texture and hierarchy, no generic agency props`

### 5. Video walkthrough cover

- File: `assets/portfolio/post-video-cover.jpg`
- Aspect: `16:10`
- Placement: poster image for the video post
- Job: make the video entry feel deliberate before playback

Prompt:

`Video walkthrough poster image for instructional design portfolio, laptop and tablet showing a training prototype with timeline notes nearby, cinematic but clean composition, strong focal screen area, subtle play-ready framing without giant play icon, realistic photography, charcoal and paper-white palette with muted blue accents, premium editorial feel, no neon effects, no tech-bro dashboard aesthetic`

### 6. Mixed-media case-study cover

- File: `assets/portfolio/post-mixed-cover.jpg`
- Aspect: `16:10`
- Placement: attach to the mixed article plus image plus video post
- Job: communicate that one post can combine formats

Prompt:

`Mixed-media portfolio cover for instructional designer case study, elegant composition combining printed storyboard sheets, image thumbnails, and a screen playing a lesson demo, clear sense of writing plus visuals plus video in one project, refined editorial photography, spacious premium styling, cool neutral grade with muted blue accents, realistic and calm, no clutter, no stock-smile people`

### 7. Author portrait

- File: `assets/portfolio/author-portrait.jpg`
- Aspect: `1:1`
- Placement: replace the abstract portrait circle in the author card
- Job: humanize the portfolio

Prompt:

`Professional but relaxed portrait for instructional designer portfolio, approachable creative professional in a clean studio or workspace, natural light, quiet editorial styling, neutral wardrobe, soft paper-white and charcoal environment with a subtle muted blue object, realistic photography, confident and thoughtful, no exaggerated corporate pose, no fake blurred office background`

### 8. Open Graph / social share image

- File: `assets/portfolio/og-garys-design.jpg`
- Aspect: `1200x630`
- Placement: social metadata image
- Job: make link previews match the site identity

Prompt:

`Open Graph image for Gary's Design portfolio, editorial composition with learning design artifacts, calm premium workspace scene, large clean text-safe area on one side for title overlay, white charcoal and muted blue palette, modern publishing aesthetic, realistic photography, uncluttered, no logos, no purple gradients`

## Optional icon direction

Do this only after the photo system is in place.

- File set: `assets/portfolio/icons/`
- Style: 1.75px monoline, square-ended or slightly rounded, no emoji
- Needed concepts: article, image gallery, video, mixed media, search, close, menu

Prompt for a matching icon set:

`Minimal editorial UI icon set for an instructional design portfolio, monoline icons on transparent background, article, gallery, video, mixed media, search, close, menu, precise geometric construction, calm modern publishing aesthetic, dark graphite stroke, no gradient, no 3d, no emoji, implementation-ready`

## Best generation order

1. `hero-cover.jpg`
2. `featured-case-study.jpg`
3. `post-mixed-cover.jpg`
4. `post-process-gallery.jpg`
5. `post-video-cover.jpg`
6. `post-article-cover.jpg`
7. `author-portrait.jpg`
8. `og-garys-design.jpg`

## Integration notes

- The hero image should stay slightly darker than the rest so white headline text remains readable.
- The feed images should all feel like the same photographer or art director handled them.
- If only one batch is generated first, do the hero + featured + three post covers. That is enough to make the page feel real.

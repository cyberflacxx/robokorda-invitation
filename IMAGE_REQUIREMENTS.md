# Image Requirements

## Local static images (`public/images`)

### Hero
- Location: `public/images/hero/`
- Required:
  - `hero-main.jpg`

### Gallery
- Location: `public/images/gallery/`
- Current files in use:
  - `gallery-01.JPG`
  - `gallery-02.JPG`
  - `gallery-03.jpg`
  - `gallery-04.jpg`
  - `gallery-05.jpg`
  - `gallery-06.jpg`
  - `gallery-07.jpg`
  - `gallery-08.jpg`
  - `gallery-09.jpg`
- Optional expansion:
  - Continue as `gallery-10.jpg`, `gallery-11.jpg`, etc.

### Venue
- Location: `public/images/venue/`
- Required:
  - `venue-01.png`
  - `venue-02.png`
  - `venue-03.png`

### Dress code
- Location: `public/images/dress-code/`
- Required:
  - `ladies-01.png`
  - `ladies-02.png`
  - `males-01.png`
  - `males-02.png`

## Logo assets
- Placeholder file in use:
  - `public/robokorda-logo-placeholder.svg`
- If replacing with production logos:
  - Light logo URL set in Admin Settings (`/admin/settings`)
  - Dark logo URL set in Admin Settings (`/admin/settings`)

## Admin-managed image URLs (database-driven)

### Gallery manager (`/admin/gallery`)
- Fields:
  - `title`
  - `imageUrl`
  - `type` (`HERO` or `GALLERY`)
- These URLs are used in the invite experience and can be Drive/public CDN URLs.

### Event settings (`/admin/settings`)
- `heroImageUrl` can override hero visual.

### Meals (`/admin/meals`)
- `imageUrl` per meal card (optional but recommended).

## Format recommendations
- Photos: `.jpg` (preferred) or `.webp`
- Transparent logos/icons: `.png` or `.svg`
- Naming format: lowercase, hyphenated, two-digit index for sequences.
- Target size:
  - Hero: `2000px+` width
  - Gallery/Venue: `1400px+` width
  - Dress code: `1200px+` width

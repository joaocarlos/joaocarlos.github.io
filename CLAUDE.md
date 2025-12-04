# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Academic website built with Hugo Extended and the PaperMod theme. Features automated publication management via OpenAlex API, custom book cataloging with role-based badges, and GitHub Actions deployment.

## Development Commands

### Setup
```bash
npm ci                    # Install Node.js dependencies (required for OpenAlex fetcher)
```

### Local Development
```bash
npm run dev              # Fetch publications + start Hugo server with drafts
npm run fetch            # Update publications from OpenAlex API only
hugo server --buildDrafts # Start Hugo dev server without fetching publications
```

### Production Build
```bash
npm run build            # Fetch publications + build site to public/
hugo --minify            # Build only (uses existing publication data)
```

## Architecture

### Publications Data Flow

The site uses a dual-source publication system:

1. **Data Generation** (`scripts/fetch-publications.js`):
   - Fetches from OpenAlex API using author IDs
   - Applies manual corrections from `data/venue-overrides.json`
   - Generates TWO files:
     - `data/publications.json` (Hugo data file, server-side)
     - `static/data/openalex-cache.json` (client-side cache)

2. **Client-Side Rendering** (`assets/js/publications.js`):
   - Loads `/data/openalex-cache.json` at runtime
   - Implements filtering, search, and export features
   - Publications page template (`layouts/papers/list.html`) is minimal - just a container

3. **Exclusion Logic**:
   - Auto-excludes dissertations/theses by type or title keywords
   - Manual exclusion via `data/venue-overrides.json` with `"exclude": true`

### Hugo Template Overrides

Custom layouts in `layouts/` override the PaperMod theme (vendored in `themes/PaperMod/`):

- `layouts/books/list.html` - Card-based grid with role badges
- `layouts/papers/list.html` - Container for client-side JS rendering
- `layouts/partials/extend_head.html` - Section-specific CSS/JS loading

**Important**: Never modify theme files directly. Use `layouts/` overrides.

### CSS Architecture

Section-specific CSS loaded via `layouts/partials/extend_head.html`:
- `assets/css/custom/publications.css` - Publications page
- `assets/css/custom/books.css` - Books page cards and badges
- `assets/css/custom/header.css` - Navigation (loaded globally)
- `assets/css/custom/social-icons.css` - Custom social icons
- `assets/css/custom/about.css` - About page styling

Hugo automatically minifies and fingerprints assets during build.

### Books Content Structure

Books use Hugo page bundles with role-based classification:

```yaml
---
title: "Book Title"
role: "chapter"           # organizer | editor | chapter | authored
chapter_title: "Title"    # For role: "chapter" only
language: "en"            # pt | en | es | fr | de | it
author: ["Author Name"]
cover:
  image: "cover.jpg"      # Place in same directory as index.md
editPost:
  URL: "https://publisher.com/book"
  Text: "Publisher Name"
---
```

Role badges rendered by `layouts/books/list.html`:
- **organizer** → "Organizer" badge
- **editor** → "Editor" badge
- **chapter** → "Chapter Author" badge (displays `chapter_title` below book title)
- **authored** → "Author" badge (default)

## Key Configuration Files

### `scripts/fetch-publications.js`

Update OpenAlex author IDs here:
```javascript
const AUTHOR_IDS = [
    "a5040609024",  // Alternative ID 1
    "a5107181246",  // Alternative ID 2
    "a5113972525",  // Alternative ID 3
]
```

### `data/venue-overrides.json`

Manual corrections for publication metadata:
```json
{
  "overrides": {
    "https://openalex.org/W1234567890": {
      "venue_name": "IEEE Conference Name",
      "venue_acronym": "ACRONYM 2024",
      "venue_location": "City, Country",
      "volume": "123",
      "issue": "4",
      "first_page": "1",
      "last_page": "10",
      "exclude": true,        // To exclude from display
      "reason": "thesis",
      "notes": "Explanation"
    }
  }
}
```

Always add `notes` field explaining the override reason.

### `config.yml`

- Site-wide configuration (baseURL, title, theme)
- Menu structure and navigation
- PaperMod theme settings (profileMode, socialIcons)
- Markup settings (unsafe HTML enabled for custom shortcodes)

## GitHub Actions Workflows

### `.github/workflows/hugo.yml` (Build & Deploy)
- Triggers: Push to `main` branch
- Hugo Extended 0.147.2
- Installs Node deps → builds with Hugo → deploys to GitHub Pages
- **Does NOT fetch publications** (uses committed cache files)

### `.github/workflows/update-openalex.yml` (Auto-Update)
- Schedule: 1st of month at 02:00 UTC
- Fetches publications → commits if changed → deploys
- Manual trigger with `force_update` option
- Commits include publication count and citation stats

## Common Development Tasks

### Adding a New Book
```bash
hugo new books/book-slug/index.md
# Add cover.jpg to books/book-slug/
# Edit front matter with role, language, chapter_title (if applicable)
```

### Excluding a Publication
Add to `data/venue-overrides.json`:
```json
"https://openalex.org/W1234567890": {
  "exclude": true,
  "reason": "thesis",
  "notes": "Master's thesis - not a publication"
}
```
Then run `npm run fetch` to regenerate data files.

### Updating Publications
```bash
npm run fetch  # Fetches from OpenAlex, applies overrides, generates data files
```

### Creating Custom Section Layout
1. Create `layouts/[section]/list.html` (Hugo auto-applies)
2. Add custom CSS in `assets/css/custom/[section].css`
3. Load CSS in `layouts/partials/extend_head.html` based on section:
   ```html
   {{- if eq .Section "section-name" }}
     {{- $css := resources.Get "css/custom/section.css" }}
     {{- if $css }}
       {{- $css := $css | resources.Minify }}
       <link rel="stylesheet" href="{{ $css.RelPermalink }}" />
     {{- end }}
   {{- end }}
   ```

## Important Development Notes

1. **Hugo Extended Required**: Uses SCSS processing and advanced features
2. **Theme Vendoring**: PaperMod is vendored in `themes/PaperMod/` - never modify directly
3. **Data Sync**: Keep `data/publications.json` and `static/data/openalex-cache.json` in sync by always using `npm run fetch`
4. **Client-Side Dependency**: Publications page requires `/data/openalex-cache.json` to be available
5. **Book Covers**: Use page bundle pattern - place `cover.jpg` in same directory as `index.md`
6. **Network Dev Server**: Use `hugo server --buildDrafts --bind=0.0.0.0` for network access
7. **Front Matter**: Books require `role` field; publications are auto-generated

## Site Structure

```
├── content/                # Markdown content
│   ├── about.md           # Biography
│   ├── papers/            # Publications (auto-generated)
│   ├── books/             # Books with role-based classification
│   ├── courses/           # Teaching courses
│   └── location.md        # Contact info
├── layouts/               # Hugo template overrides
│   ├── books/list.html    # Book card layout
│   ├── papers/list.html   # Publications container
│   └── partials/          # Reusable components
├── assets/
│   ├── css/custom/        # Section-specific CSS
│   └── js/                # Client-side JavaScript
├── data/                  # Hugo data files
│   ├── publications.json  # Generated by fetch script
│   └── venue-overrides.json # Manual corrections
├── static/data/           # Public cache files
│   └── openalex-cache.json # Client-side publication data
└── scripts/
    └── fetch-publications.js # OpenAlex API fetcher
```

## Troubleshooting

- **Publications not loading**: Check OpenAlex author IDs in `scripts/fetch-publications.js`
- **Styles not applying**: Verify CSS files exist in `assets/css/custom/` and check `layouts/partials/extend_head.html`
- **Data out of sync**: Run `npm run fetch` to regenerate both `data/publications.json` and `static/data/openalex-cache.json`
- **Hugo server errors**: Ensure Hugo Extended is installed (`hugo version` should show "extended")
- **GitHub Actions failing**: Check repository permissions for GitHub Pages deployment

# Copilot Instructions for Academic Hugo Site

This is an academic website built with **Hugo Extended** + **PaperMod theme** with a custom OpenAlex integration for automated publication management.

## Architecture Overview

**Core Components:**

-   `content/` - Markdown content (about, papers, books, courses)
-   `layouts/` - Hugo template overrides (books/list.html, papers/list.html custom layouts)
-   `scripts/fetch-publications.js` - Node.js OpenAlex API fetcher
-   `data/venue-overrides.json` - Manual corrections for publication metadata
-   `assets/js/publications.js` - Client-side publications rendering (reads `/data/openalex-cache.json`)
-   `assets/css/custom/` - Custom CSS (publications.css, books.css, social-icons.css)

**Data Flow:**

1. `npm run fetch` → calls OpenAlex API → applies venue-overrides.json → generates:
    - `data/publications.json` (Hugo data file)
    - `static/data/openalex-cache.json` (client-side cache)
    - `public/data/openalex-cache.json` (build output)
2. Hugo builds site reading data files
3. Client JS (`assets/js/publications.js`) loads `/data/openalex-cache.json` for dynamic filtering

## Critical Workflows

### Local Development

```bash
npm run fetch       # Update publications from OpenAlex
npm run dev         # Fetch + start Hugo server with drafts
npm run build       # Fetch + production build
```

**VS Code Tasks** (prefer these over terminal commands):

-   "Hugo: Build and Serve" - starts dev server
-   "OpenAlex: Update Publications Cache" - fetches publications
-   "Build: Full Site with Updated Publications" - full rebuild

### Hugo Configuration

-   **config.yml**: Site config, menus, social links, profileMode settings
-   **Hugo Extended required**: Uses SCSS processing
-   **Theme**: PaperMod vendored in `themes/PaperMod/` - DO NOT modify theme files directly, use `layouts/` overrides

## Content Patterns

### Books Front Matter (content/books/\*/index.md)

```yaml
---
title: "Book Title"
role: "chapter" # organizer | editor | chapter | authored
chapter_title: "Chapter Title" # For chapters only
language: "en" # pt | en | es | fr | de | it
author: ["Author Name"]
description: "Book description"
cover:
    image: "cover.jpg" # Place in same directory as index.md
editPost:
    URL: "https://publisher.com/book"
    Text: "Publisher Name"
---
```

**Role badges** rendered by `layouts/books/list.html`:

-   `organizer` → "Organizer" badge
-   `editor` → "Editor" badge
-   `chapter` → "Chapter Author" badge (displays chapter_title below book title)
-   `authored` → "Author" badge (default)

### Publication Data Management

**OpenAlex Author IDs** in `scripts/fetch-publications.js`:

```javascript
const AUTHOR_IDS = ["a5040609024", "a5107181246", "a5113972525"]
```

**Venue Overrides** in `data/venue-overrides.json`:

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
            "exclude": true, // To exclude thesis/dissertation
            "reason": "thesis",
            "notes": "Explanation"
        }
    }
}
```

**Exclusion Logic** (`scripts/fetch-publications.js` and `assets/js/publications.js`):

-   Auto-excludes: `type_crossref === "dissertation"`, `type === "dissertation"`, or title contains "thesis"
-   Manual exclusion: Set `"exclude": true` in venue-overrides.json

## Custom Layouts

### Books Grid Layout (`layouts/books/list.html`)

-   Card-based responsive grid (`.books-grid`)
-   Cover images from page bundle or global resources
-   Role badges with color coding (`.badge-organizer`, `.badge-editor`, etc.)
-   Language badges (`.badge-language-pt`, etc.)
-   Chapter titles displayed below book title for `role: "chapter"`

### Publications List (`layouts/papers/list.html`)

-   Minimal template - actual rendering handled by `assets/js/publications.js`
-   Client-side filtering and search
-   Reads `/data/openalex-cache.json` at runtime

## CSS Architecture

Custom styles in `assets/css/custom/`:

-   `publications.css` - Publications page grid, badges, filters
-   `books.css` - Book cards, role badges, cover styling
-   `social-icons.css` - Custom social icon SVGs

Hugo auto-loads CSS based on page type (see `layouts/partials/extend_head.html` pattern).

## CI/CD (GitHub Actions)

### `.github/workflows/hugo.yml`

-   Triggers on push to `main`
-   Hugo Extended 0.147.2
-   Installs Node deps → runs `npm ci` → builds with Hugo → deploys to GitHub Pages
-   **Does NOT fetch publications** (uses committed cache)

### `.github/workflows/update-openalex.yml`

-   Scheduled: 1st of month at 02:00 UTC
-   Fetches publications → checks for changes → commits if changed → triggers hugo.yml
-   Manual trigger available with `force_update` option

## Development Guidelines

1. **Never modify theme files** in `themes/PaperMod/` - use `layouts/` overrides
2. **Test publication changes**: Run `npm run fetch` then check `static/data/openalex-cache.json`
3. **Book covers**: Place in same directory as `index.md` (page bundle pattern)
4. **Front matter validation**: Books require `role` field, publications auto-generated
5. **Hugo server**: Use `hugo server --buildDrafts --bind=0.0.0.0` for network access
6. **Venue overrides**: Always add `notes` field explaining override reason
7. **Data files sync**: Ensure `data/publications.json` and `static/data/openalex-cache.json` stay in sync
8. **Client-side rendering**: Publications page depends on `/data/openalex-cache.json` being available

## Common Patterns

**Adding a new book:**

```bash
hugo new books/book-slug/index.md
# Add cover.jpg to books/book-slug/
# Edit front matter with role, language, etc.
```

**Excluding a publication:**
Add to `data/venue-overrides.json`:

```json
"https://openalex.org/W1234567890": {
  "exclude": true,
  "reason": "thesis",
  "notes": "Master's thesis - not a publication"
}
```

**Custom layout for new section:**

1. Create `layouts/[section]/list.html` (Hugo auto-applies)
2. Add custom CSS in `assets/css/custom/[section].css`
3. Load CSS in `layouts/partials/extend_head.html` based on page type

## Key Files Reference

-   `config.yml` - Site configuration, menus, social links
-   `scripts/fetch-publications.js` - OpenAlex fetcher (update AUTHOR_IDS here)
-   `data/venue-overrides.json` - Manual publication metadata corrections
-   `assets/js/publications.js` - Client-side publications renderer
-   `layouts/books/list.html` - Book grid with role-based badges
-   `layouts/papers/list.html` - Publications container (JS handles rendering)
-   `doc/OPENALEX-AUTOMATION.md` - Detailed automation documentation

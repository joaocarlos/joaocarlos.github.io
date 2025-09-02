# João Carlos N. Bittencourt — Academic Website

[![Hugo Extended](https://img.shields.io/badge/Hugo-Extended-FF4088?style=for-the-badge&logo=hugo&logoColor=white)](https://gohugo.io/)
[![Theme: PaperMod](https://img.shields.io/badge/Theme-PaperMod-1F2328?style=for-the-badge&logo=github&logoColor=white)](https://github.com/adityatelange/hugo-PaperMod)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=for-the-badge&logo=node.js&logoColor=white)](package.json)
[![Build & Deploy](https://img.shields.io/github/actions/workflow/status/joaocarlos/website/hugo.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=Build%20%26%20Deploy)](https://github.com/joaocarlos/website/actions/workflows/hugo.yml)
[![Update OpenAlex](https://img.shields.io/github/actions/workflow/status/joaocarlos/website/update-openalex.yml?branch=main&style=for-the-badge&logo=clockwise&logoColor=white&label=Auto%20Update)](https://github.com/joaocarlos/website/actions/workflows/update-openalex.yml)

## Overview

Personal academic website for João Carlos N. Bittencourt. Built with Hugo and the PaperMod theme, featuring:

-   **Publications**: Automatically fetched from OpenAlex API with custom filtering and rendering
-   **Books & Chapters**: Card-based layout with role-based badges (Author, Editor, Organizer, Chapter Author)
-   **Teaching & Supervision**: Course information and student supervision details
-   **Contact & Location**: Office hours, location, and contact information
-   **Automated Deployment**: GitHub Actions for building and auto-updating content

## Tech Stack

-   **Hugo**: Static site generator with extended build support
-   **Theme**: PaperMod (vendored in `themes/PaperMod/`) with custom overrides
-   **Data Fetching**: Node.js script for OpenAlex API integration (`scripts/fetch-publications.js`)
-   **Custom UI**: Enhanced CSS/JS in `assets/css/custom/` and `assets/js/`
-   **CI/CD**: GitHub Actions workflows for automated deployment and content updates

## Project Structure

```
├── content/                 # Markdown content
│   ├── about.md            # Biography and profile
│   ├── papers/             # Publications (auto-generated from OpenAlex)
│   ├── books/              # Books and chapters with role-based classification
│   ├── courses/            # Teaching courses
│   ├── location.md         # Contact and location info
│   └── officehours.md      # Office hours
├── layouts/                # Hugo template overrides
│   ├── books/list.html     # Custom book card layout
│   ├── papers/list.html    # Custom publications layout
│   └── partials/           # Reusable template components
├── assets/                 # Source assets (processed by Hugo)
│   ├── css/custom/         # Custom stylesheets
│   │   ├── publications.css # Publications page styling
│   │   ├── books.css       # Books page card layout & badges
│   │   └── social-icons.css # Custom social icons
│   └── js/                 # JavaScript files
├── data/                   # Data files
│   ├── publications.json   # Generated publications data
│   └── venue-overrides.json # Manual venue corrections
├── static/                 # Static assets (served as-is)
│   └── data/              # Public data files for client-side access
├── scripts/               # Build and utility scripts
│   └── fetch-publications.js # OpenAlex data fetcher
└── .github/workflows/     # GitHub Actions
    ├── hugo.yml           # Build and deploy workflow
    └── update-openalex.yml # Monthly publication updates
```

**Local Development**

**Requirements**: Hugo Extended, Node.js 18+, npm

### Setup Steps

1. **Install dependencies**: `npm ci`
2. **Development mode**: `npm run dev` (fetches publications, then starts Hugo server with drafts)
3. **Production build**: `npm run build` (fetch + hugo build → outputs to `public/`)

### Available Commands

-   `npm run fetch` - Update publications from OpenAlex API
-   `npm run dev` - Development server with live reload
-   `npm run build` - Production build

**Note**: The publications page reads `static/data/openalex-cache.json` (preferred) or `data/publications.json` as fallback.

## Publications Data Management

### OpenAlex Integration

-   **Source**: OpenAlex API filtered by author IDs
-   **Configuration**: Edit `scripts/fetch-publications.js` and set `AUTHOR_IDS` array
-   **Automation**: Monthly updates via GitHub Actions workflow

### Manual Overrides

Edit `data/venue-overrides.json` to:

-   Override venue names, acronyms, or locations
-   Set volume/issue/pages for publications
-   Exclude entries (e.g., theses) with `"exclude": true`

### Output Files

-   `data/publications.json` - Hugo data file
-   `static/data/openalex-cache.json` - Public cache for client-side rendering
-   `public/data/openalex-cache.json` - Generated during build

## Books & Chapters Configuration

The books section supports role-based classification with custom styling:

### Content Structure

```markdown
---
title: "Book Title"
role: "chapter" # organizer, editor, chapter, authored
chapter_title: "Chapter Title" # For chapters only
language: "en" # pt, en, es, fr, de, it
author: ["Author Name"]
cover:
    image: "cover.jpg"
---
```

### Role Types

-   **organizer** - Book organizer/coordinator
-   **editor** - Book editor
-   **chapter** - Chapter author (displays chapter title below book title)
-   **authored** - Book author (default)

## Deployment

### GitHub Pages Setup

1. **Fork** this repository to your GitHub account
2. **Configure Pages**: Go to Settings → Pages, select "GitHub Actions" as source
3. **Environment**: Repository must be public or have GitHub Pro for private repo Pages
4. **Domain**: Optionally configure custom domain in repo Settings → Pages

### Workflow Details

-   **Build & Deploy**: `.github/workflows/hugo.yml` triggers on push to `main`
-   **Auto-Update**: `.github/workflows/update-openalex.yml` runs monthly
-   **Base URL**: Automatically configured in CI from repository settings

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy public/ folder to your hosting provider
```

## Customization Guide

### Quick Fork Setup

1. Fork the repository on GitHub
2. Update `scripts/fetch-publications.js` with your OpenAlex author IDs:

    ```javascript
    const AUTHOR_IDS = ["your-openalex-id-1", "your-openalex-id-2"]
    ```

3. Edit `config.yml` with your details:

    ```yaml
    baseURL: "https://yourusername.github.io"
    title: "Your Name"
    ```

4. Update content in `content/about.md` and other pages
5. Commit and push to `main` - GitHub Actions will deploy automatically

### Advanced Customization

-   **Site Configuration**: `config.yml` (menus, social links, analytics)
-   **Styling**: Custom CSS in `assets/css/custom/`
-   **Templates**: Override layouts in `layouts/` directory
-   **Content**: Add/edit Markdown files in `content/`

### Custom CSS Loading

The site automatically loads section-specific CSS:

-   Publications: `assets/css/custom/publications.css`
-   Books: `assets/css/custom/books.css`
-   Social Icons: `assets/css/custom/social-icons.css`

## Features

### Publications Page

-   Automatic data fetching from OpenAlex API
-   Custom filtering and search functionality
-   Open access indicators and venue badges
-   Export capabilities (BibTeX, etc.)

### Books Page

-   Card-based layout with cover images
-   Role-based classification badges
-   Language indicators
-   Chapter title display for chapter entries
-   Publisher links and metadata

### Responsive Design

-   Mobile-optimized layouts
-   Adaptive grid systems for publications and books
-   Touch-friendly navigation and interactions

## Troubleshooting

### Common Issues

1. **Hugo server not starting**: Ensure Hugo Extended is installed
2. **Publications not loading**: Check OpenAlex author IDs in fetch script
3. **Styles not applying**: Verify CSS files are in `assets/css/custom/`
4. **GitHub Actions failing**: Check repository is public or has proper permissions

### Local Development Tips

-   Use `hugo server --disableFastRender` for full rebuilds
-   Run `npm run fetch` to update publications data
-   Check browser console for JavaScript errors
-   Verify image paths are relative to content files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

## License

-   **Code**: MIT License (see `LICENSE.md`)
-   **Content**: © João Carlos N. Bittencourt, unless otherwise stated

## Credits

Built with [Hugo](https://gohugo.io/) and [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme. Custom enhancements for academic publishing workflows, publications management, and responsive book cataloging.

**Deploy (GitHub Pages)**

-   This repo includes a Pages workflow: `.github/workflows/hugo.yml`.
-   Steps to deploy on your fork:
    -   Fork the repository to your GitHub account.
    -   In your fork, go to Settings → Pages and select “Build and deployment: GitHub Actions”.
    -   Push to `main` to trigger the workflow. The action builds with `hugo --minify` and deploys the `public/` artifact to Pages.
    -   Base URL is set automatically in CI, but you can set `baseURL` in `config.yml` for local use.

**Auto-Update Publications**

-   Workflow: `.github/workflows/update-openalex.yml` runs monthly and can be triggered manually (Actions → “Update OpenAlex Cache”).
-   What it does: Installs deps, runs `npm run fetch`, commits updated JSON files, rebuilds the site, and redeploys Pages when changes are detected.
-   To enable on your fork: Ensure Actions are enabled for the repo; optionally trigger once via the “Run workflow” button. No extra secrets required.

**Customize for Yourself**

-   Site settings: Edit `config.yml` (title, description, menus, profileMode image/text, social icons, analytics, math).
-   Publications authors: Update `scripts/fetch-publications.js:AUTHOR_IDS`.
-   Styling: Tweak CSS in `assets/css/custom/` and JS in `assets/js/publications.js`.
-   Content: Edit or add pages under `content/` (e.g., `content/about.md`, `content/papers/_index.md`, `content/books/…`).

**Quick Start (Fork & Redeploy)**

-   Fork the repo on GitHub.
-   Update `scripts/fetch-publications.js` with your OpenAlex author IDs.
-   Optionally edit `config.yml` with your name, links, and profile details.
-   Run locally: `npm ci && npm run dev`.
-   Commit and push to `main`. GitHub Actions will build and publish to Pages.
-   Enable the monthly update workflow if you want automatic publication refreshes.

**Optional: Custom Domain**

-   Configure a CNAME in repo Settings → Pages and add a DNS CNAME record pointing to `<username>.github.io`. If you add a `CNAME` file to the project root, Pages will respect it on deploy.

**Notes & Caveats**

-   The `public/` directory is a build artifact. CI uploads it as the deployment artifact; you do not need to commit it.
-   If scheduled workflows do not run on forks by default, trigger the “Update OpenAlex Cache” workflow manually once to initialize.

**Credits**

-   Built with Hugo and PaperMod. The site contains customizations in `layouts/partials/extend_head.html` and `assets/*` to render publications with badges, open-access indicators, and filters.

**License**

-   Code: MIT (see `LICENSE.md`).
-   Content: Unless stated otherwise, content is © the site author.

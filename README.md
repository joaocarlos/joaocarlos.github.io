# João Carlos N. Bittencourt - Academic Website

Personal academic website built with [Hugo](https://gohugo.io/) and the [Academia theme](https://github.com/joaocarlos/Hugo-academia).

🌐 **Live site:** [joaocarlos.github.io](https://joaocarlos.github.io)

## Features

-   📄 Publications synced from [OpenAlex](https://openalex.org/) API
-   🌍 Multilingual support (English / Português)
-   🌙 Dark mode support
-   📱 Responsive design
-   ♿ Accessible (WCAG compliant)

## Development

### Prerequisites

-   [Hugo Extended](https://gohugo.io/installation/) v0.128.0+
-   [Node.js](https://nodejs.org/) 18+ (for scripts)
-   Git

### Setup

```bash
# Clone with submodules
git clone --recursive git@github.com:joaocarlos/joaocarlos.github.io.git
cd joaocarlos.github.io

# Run development server
hugo server -D
```

Visit `http://localhost:1313`

### Update Publications

Publications are fetched from OpenAlex and stored locally:

```bash
# Fetch latest publications
node scripts/openalex-fetch-publications.js

# Generate markdown files for new papers
node scripts/generate-paper-pages.js
```

This runs automatically monthly via GitHub Actions.

## Project Structure

```
├── content/           # Site content (markdown)
│   ├── about.md
│   ├── papers/        # Publications
│   ├── courses/       # Teaching
│   ├── projects/      # Research projects
│   └── supervision/   # Student supervision
├── data/              # Data files
│   └── publications.json
├── static/            # Static assets
│   ├── images/
│   └── data/
├── themes/academia/   # Theme (git submodule)
├── hugo.yaml          # Site configuration
└── scripts/           # Build scripts
```

## Deployment

Site deploys automatically to GitHub Pages on push to `main`.

-   **Hugo build:** `.github/workflows/hugo.yml`
-   **Publications update:** `.github/workflows/update-openalex.yml` (monthly)

## License

Content © João Carlos N. Bittencourt. Theme under MIT License.

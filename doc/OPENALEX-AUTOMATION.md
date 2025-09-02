# OpenAlex Cache Automation

This document describes the automated system for updating publication data from OpenAlex on a monthly basis.

## Overview

The automation uses GitHub Actions to:

1. Fetch the latest publications from OpenAlex API
2. Apply venue overrides and process the data
3. Update the cache files in the repository
4. Rebuild and deploy the Hugo site to GitHub Pages

## Automation Schedule

-   **Frequency**: First day of every month at 02:00 UTC
-   **Trigger**: GitHub Actions cron schedule
-   **Manual Trigger**: Available via GitHub Actions "Run workflow" button

## Files Updated

The automation updates the following files:

-   `data/publications.json` - Processed publication data with statistics
-   `public/data/openalex-cache.json` - Cached data for the website
-   `static/data/openalex-cache.json` - Hugo static file cache

## Workflow Process

### 1. Fetch Publications

```bash
npm run fetch
```

This runs `fetch-publications-enhanced.js` which:

-   Queries OpenAlex API for publications by author IDs
-   Applies venue overrides from `data/venue-overrides.json`
-   Calculates statistics (citations, H-index, etc.)
-   Saves processed data to multiple locations

### 2. Change Detection

The workflow checks if any publication data has changed:

-   If no changes: Skip deployment (saves resources)
-   If changes detected: Proceed with commit and deployment

### 3. Commit Changes

When changes are detected:

-   Commits updated files with detailed message including:
    -   Publication count
    -   Total citations
    -   Date of update
-   Pushes changes to the repository

### 4. Deploy to GitHub Pages

-   Builds the Hugo site with updated data
-   Deploys to GitHub Pages automatically

## Manual Testing

### VS Code Tasks

Three tasks are available in VS Code:

1. **"OpenAlex: Update Publications Cache"**

    - Fetches latest data from OpenAlex
    - Updates local cache files

2. **"Hugo: Build and Serve"**

    - Starts local Hugo development server

3. **"Build: Full Site with Updated Publications"**
    - Updates publications cache + builds complete site

### Command Line

```bash
# Update publications only
npm run fetch

# Update publications and build site
npm run build

# Start development server with current data
npm run dev
```

## Manual Workflow Trigger

You can manually trigger the automation:

1. Go to GitHub → Actions → "Update OpenAlex Cache"
2. Click "Run workflow"
3. Optionally check "Force update" to rebuild even without changes

## Configuration

### Author IDs

Edit the `AUTHOR_IDS` array in `fetch-publications-enhanced.js`:

```javascript
const AUTHOR_IDS = [
    "a5040609024", // Main author ID
    "a5107181246", // Alternative ID 1
    "a5113972525", // Alternative ID 2
]
```

### Venue Overrides

Add custom venue information in `data/venue-overrides.json`:

```json
{
    "overrides": {
        "publication-id": {
            "venue_name": "Custom Venue Name",
            "venue_location": "Location",
            "notes": "Override reason"
        }
    }
}
```

### Schedule Modification

To change the update frequency, edit the cron expression in `.github/workflows/update-openalex.yml`:

```yaml
schedule:
    - cron: "0 2 1 * *" # First day of month at 02:00 UTC
```

## Monitoring

### GitHub Actions

-   View automation status in GitHub → Actions
-   Check logs for detailed execution information
-   Monitor for failures and troubleshoot issues

### Commit History

-   Each successful update creates a detailed commit message
-   Track publication count and citation changes over time
-   Review what files were updated

### Website Stats

The publications page shows:

-   Total publications count
-   Citation metrics
-   H-index calculation
-   Open access percentage
-   Last update timestamp

## Troubleshooting

### Common Issues

1. **API Rate Limits**

    - OpenAlex has generous rate limits
    - Workflow includes error handling for API failures

2. **Network Failures**

    - Workflow retries automatically
    - Manual trigger available for immediate retry

3. **Invalid Data**

    - Venue overrides can fix incorrect OpenAlex data
    - Script validates data before saving

4. **Deployment Failures**
    - Check GitHub Actions logs
    - Verify Hugo build process
    - Ensure GitHub Pages is enabled

### Emergency Manual Update

If automation fails, update manually:

1. Clone repository locally
2. Run `npm install` to install dependencies
3. Run `npm run fetch` to update publications
4. Commit and push changes
5. GitHub Pages will auto-deploy

## Security Notes

-   Uses GitHub token with minimal required permissions
-   No external secrets required (OpenAlex API is public)
-   All data processing happens in GitHub's secure environment
-   Repository write access limited to the automation workflow

## Benefits

-   **Automated**: No manual intervention required
-   **Current**: Publications always up-to-date
-   **Efficient**: Only updates when changes detected
-   **Reliable**: Built-in error handling and retry mechanisms
-   **Transparent**: Full audit trail of all updates
-   **Flexible**: Easy manual triggering when needed

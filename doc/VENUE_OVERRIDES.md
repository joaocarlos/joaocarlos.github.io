# Venue Overrides - Simplified Format

The venue overrides file (`data/venue-overrides.json`) now uses a simplified format where you only need to specify the fields you want to override. All other values will be kept from the original OpenAlex data.

## Format

```json
{
    "description": "Manual venue information overrides for publications missing venue data in OpenAlex. Only specify the fields you want to override - other values will be kept from the original source.",
    "lastUpdated": "2025-06-18",
    "overrides": {
        "https://openalex.org/W1234567890": {
            "venue_name": "Conference Name",
            "venue_acronym": "CONF 2024",
            "venue_location": "City, Country",
            "volume": "5",
            "issue": "2",
            "first_page": "123",
            "last_page": "456",
            "notes": "Optional notes about this override"
        },
        "https://openalex.org/W0987654321": {
            "exclude": true,
            "reason": "thesis",
            "notes": "Exclude from publication list"
        }
    }
}
```

## Available Override Fields

### Venue Information

-   `venue_name`: Override the venue display name
-   `venue_acronym`: Set the venue acronym (used in formatting)
-   `venue_location`: Set the venue location (displayed for conferences)

### Bibliographic Information

-   `volume`: Journal volume number
-   `issue`: Journal issue number
-   `first_page`: First page number
-   `last_page`: Last page number

### Exclusion

-   `exclude`: Set to `true` to exclude this publication from the list
-   `reason`: Reason for exclusion (e.g., "thesis", "duplicate", etc.)

### Metadata

-   `notes`: Optional notes about this override (for documentation purposes)

## Key Features

1. **Minimal Overrides**: Only specify the fields you want to change
2. **Automatic Exclusion**: Publications marked with `"exclude": true` are filtered out
3. **Thesis Filtering**: Thesis entries are automatically excluded from the publication list
4. **Full OpenAlex ID**: Use the complete OpenAlex URL as the key (e.g., `https://openalex.org/W1234567890`)

## Workflow

1. Edit `data/venue-overrides.json` to add/modify overrides
2. Run `npm run fetch` to regenerate the cached data with overrides applied
3. Build the site with `hugo` or use `npm run dev` for development

## Automatic Thesis Exclusion

The system automatically excludes:

-   Publications with `type_crossref` or `type` set to "thesis" or "dissertation"
-   Publications manually marked with `"exclude": true` in venue overrides
-   Publications from university venues that appear to be thesis-related

This ensures your publication list only includes published research papers, conference proceedings, journal articles, and book chapters.

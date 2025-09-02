# Publications Data

This directory contains local publication data that can be used instead of fetching from the OpenAlex API.

## File Format Support

The publications page supports both JSON and YAML formats:

1. **JSON** (`publications.json`) - Recommended format, fully supported
2. **YAML** (`publications.yaml`) - Basic support, requires additional setup

## Priority Order

The system will try to load data in this order:

1. `/data/publications.json` (JSON format)
2. `/data/publications.yaml` (YAML format)
3. OpenAlex API (fallback)

## Data Structure

Both files should contain:

```yaml
stats:
    totalPapers: number
    totalCitations: number
    hIndex: number
    openAccessCount: number

publications:
    - id: string (OpenAlex work ID)
      title: string
      display_name: string
      publication_year: number
      publication_date: string (YYYY-MM-DD)
      cited_by_count: number
      type: string (journal-article, proceedings-article, etc.)
      type_crossref: string
      so: string (source/journal name)
      host_venue:
          display_name: string
          type: string (journal, conference)
          issn_l: string (optional)
      primary_location:
          source:
              display_name: string
              type: string
      open_access:
          is_oa: boolean
          oa_date: string or null
          oa_url: string or null
      doi: string
      authorships:
          - author:
                display_name: string
                id: string (OpenAlex author ID)
            author_position: string (first, middle, last)
```

## Using YAML Format

To enable YAML support, you need to include the js-yaml library. Add this line to your publications page:

```html
<script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
```

Then update the `parseSimpleYAML` function to use:

```javascript
return jsyaml.load(yamlText)
```

## Sample Data

The included `publications.json` contains 15 sample publications with realistic academic data including:

-   Mix of journal articles and conference proceedings
-   Various citation counts
-   Open access and closed access papers
-   Multiple authors and collaborations
-   Publications spanning 2019-2024

You can modify this data to match your actual publications or use it as a template.

## Notes

-   The JSON format is recommended for reliability and performance
-   All data should follow the OpenAlex API structure for compatibility
-   The system will automatically calculate statistics if using the API, but local data should include pre-calculated stats
-   DOI links and open access URLs should be functional when possible

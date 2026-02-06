import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, "..")

// OpenAlex API configuration
const AUTHOR_IDS = [
    "a5040609024", // Alternative ID 1
    "a5107181246", // Alternative ID 2
    "a5113972525", // Alternative ID 3
    "a5121092256", // Alternative ID 4
]

const PER_PAGE = 200
const BASE_API_URL = `https://api.openalex.org/works?filter=authorships.author.id:${AUTHOR_IDS.join(
    "|",
)}&sort=publication_year:desc&per_page=${PER_PAGE}`

async function fetchAllPublications() {
    const allResults = []
    let page = 1
    let hasMore = true

    while (hasMore) {
        const url = `${BASE_API_URL}&page=${page}`
        console.log(`Fetching page ${page}...`)

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.results || data.results.length === 0) {
            hasMore = false
        } else {
            allResults.push(...data.results)
            hasMore = data.results.length === PER_PAGE
            page++
        }
    }

    return allResults
}

async function fetchPublications() {
    try {
        console.log("Fetching publications from OpenAlex API...")
        const results = await fetchAllPublications()

        if (results.length === 0) {
            throw new Error("No publications found")
        }

        console.log(`Found ${results.length} publications`)

        // Process publications
        const processedPublications = results.map((pub) => {
            // Get venue from OpenAlex (display_name or raw_source_name)
            const venueName =
                pub.primary_location?.source?.display_name ||
                pub.primary_location?.raw_source_name ||
                null

            return {
                id: pub.id,
                title: pub.display_name || pub.title,
                authors:
                    pub.authorships?.map((a) => ({
                        name: a.author?.display_name,
                        orcid: a.author?.orcid,
                        isCorresponding: a.is_corresponding,
                        position: a.author_position,
                    })) || [],
                journal: venueName,
                year: pub.publication_year,
                month: pub.publication_date
                    ? new Date(pub.publication_date).getMonth() + 1
                    : null,
                date: pub.publication_date,
                doi: pub.doi,
                url: pub.primary_location?.landing_page_url || pub.doi,
                citations: pub.cited_by_count || 0,
                isOpenAccess: pub.open_access?.is_oa || false,
                oaUrl: pub.open_access?.oa_url,
                publicationType: pub.type_crossref,
                volume: pub.biblio?.volume,
                issue: pub.biblio?.issue,
                pages: {
                    first: pub.biblio?.first_page,
                    last: pub.biblio?.last_page,
                },
                keywords: pub.keywords?.map((k) => k.display_name) || [],
                topics:
                    pub.topics?.slice(0, 3).map((t) => t.display_name) || [],
                abstract: pub.abstract_inverted_index
                    ? reconstructAbstract(pub.abstract_inverted_index)
                    : null,
                venue: pub.primary_location?.source,
                language: pub.language,
                isRetracted: pub.is_retracted,
                citationsPerYear: pub.counts_by_year || [],
                lastUpdated: new Date().toISOString(),
                // Store raw OpenAlex data separately for reference
                _raw: pub,
            }
        })

        // Calculate statistics
        const stats = calculateStats(processedPublications)

        // Create the data structure to save
        const publicationsData = {
            publications: processedPublications,
            stats,
            lastFetched: new Date().toISOString(),
            totalCount: processedPublications.length,
        }

        // Ensure data directories exist (use absolute paths)
        const dataDir = path.join(PROJECT_ROOT, "data")
        const staticDataDir = path.join(PROJECT_ROOT, "static/data")

        await fs.mkdir(dataDir, { recursive: true })
        await fs.mkdir(staticDataDir, { recursive: true })

        // Save the processed data
        await fs.writeFile(
            path.join(dataDir, "publications.json"),
            JSON.stringify(publicationsData, null, 2),
        )

        // Save cache to static (Hugo will copy to public on build)
        const cacheData = {
            results: processedPublications,
            meta: {
                count: processedPublications.length,
                lastUpdated: new Date().toISOString(),
            },
        }

        await fs.writeFile(
            path.join(staticDataDir, "openalex-cache.json"),
            JSON.stringify(cacheData, null, 2),
        )

        console.log(
            `Successfully saved ${processedPublications.length} publications`,
        )
        console.log(
            `Statistics: ${stats.totalCitations} citations, H-index: ${stats.hIndex}, ${stats.openAccessCount} open access papers`,
        )

        // Log publications with missing venue for manual adjustment in markdown files
        const missingVenue = processedPublications.filter((p) => !p.journal)
        if (missingVenue.length > 0) {
            console.log(
                `\n[!] Publications with missing venue (${missingVenue.length}):`,
            )
            missingVenue.forEach((p) => {
                console.log(`    - ${p.title.substring(0, 60)}... (${p.year})`)
            })
            console.log(
                "    > Edit the markdown files directly to add venue information",
            )
        }

        return publicationsData
    } catch (error) {
        console.error("Error fetching publications:", error)
        process.exit(1)
    }
}

function reconstructAbstract(invertedIndex) {
    if (!invertedIndex) return null

    // Find the maximum position to determine array size
    let maxPos = 0
    for (const positions of Object.values(invertedIndex)) {
        for (const pos of positions) {
            if (pos > maxPos) maxPos = pos
        }
    }

    // Pre-allocate array for better performance
    const words = new Array(maxPos + 1)
    for (const [word, positions] of Object.entries(invertedIndex)) {
        for (const pos of positions) {
            words[pos] = word
        }
    }

    return words.filter(Boolean).join(" ")
}

function calculateStats(publications) {
    const totalCitations = publications.reduce(
        (sum, pub) => sum + pub.citations,
        0,
    )
    const openAccessCount = publications.filter(
        (pub) => pub.isOpenAccess,
    ).length

    // Calculate H-index
    const citations = publications
        .map((pub) => pub.citations)
        .sort((a, b) => b - a)
    let hIndex = 0
    for (let i = 0; i < citations.length; i++) {
        if (citations[i] >= i + 1) {
            hIndex = i + 1
        } else {
            break
        }
    }

    // Calculate publications by year
    const byYear = {}
    publications.forEach((pub) => {
        const year = pub.year || "Forthcoming"
        byYear[year] = (byYear[year] || 0) + 1
    })

    // Calculate publications by type
    const byType = {}
    publications.forEach((pub) => {
        const type = pub.publicationType || "other"
        byType[type] = (byType[type] || 0) + 1
    })

    return {
        totalPapers: publications.length,
        totalCitations,
        hIndex,
        openAccessCount,
        averageCitations:
            Math.round((totalCitations / publications.length) * 10) / 10,
        publicationsByYear: byYear,
        publicationsByType: byType,
        mostCitedPaper: publications.reduce(
            (max, pub) => (pub.citations > max.citations ? pub : max),
            { citations: 0 },
        ),
        recentPapers: publications.filter(
            (pub) => pub.year >= new Date().getFullYear() - 2,
        ).length,
    }
}

// Run the script
fetchPublications()

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, "..")

const PAPERS_DIR = path.join(PROJECT_ROOT, "content/papers")
const PUBLICATIONS_FILE = path.join(PROJECT_ROOT, "data/publications.json")

/**
 * Extract OpenAlex ID from full URL
 * e.g., "https://openalex.org/W334391379" -> "W334391379"
 */
function extractOpenAlexId(url) {
    return url.split("/").pop()
}

/**
 * Determine publication type based on OpenAlex data
 */
function getPublicationType(pub) {
    const raw = pub._raw || {}
    const type = raw.type || ""
    const rawType = raw.primary_location?.raw_type || ""

    if (type === "dissertation" || rawType === "dissertation") return "thesis"
    if (rawType === "proceedings-article" || rawType === "conference-paper")
        return "conference"
    if (type === "book" || rawType === "book") return "book"
    if (type === "book-chapter" || rawType === "book-chapter") return "chapter"
    if (rawType === "journal-article" || type === "article") return "journal"
    if (type === "preprint" || rawType === "posted-content") return "preprint"

    return "conference" // Default
}

/**
 * Get topics for tags (OpenAlex topics are scored and more meaningful than keywords)
 */
function getTopics(topics, maxCount = 5) {
    // Topics from OpenAlex are already sorted by score (relevance)
    return (topics || []).slice(0, maxCount)
}

/**
 * Escape special characters in YAML strings
 */
function escapeYaml(str) {
    if (!str) return ""
    // If string contains special characters, wrap in quotes
    if (
        str.includes(":") ||
        str.includes("#") ||
        str.includes("'") ||
        str.includes('"')
    ) {
        return `"${str.replace(/"/g, '\\"')}"`
    }
    return str
}

/**
 * Generate a BibTeX citation key from author name and year
 * e.g., "João Carlos N. Bittencourt" + 2024 -> "bittencourt2024"
 */
function generateBibtexKey(pub) {
    const firstAuthor = pub.authors?.[0]?.name || "unknown"
    // Extract last name (handle "First Last" and "First M. Last" formats)
    const nameParts = firstAuthor.split(" ")
    const lastName = nameParts[nameParts.length - 1].toLowerCase()
    // Remove accents and special characters
    const cleanLastName = lastName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "")

    // Add first word of title for uniqueness
    const titleWord = (pub.title || "")
        .split(" ")[0]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "")

    return `${cleanLastName}${pub.year}${titleWord}`
}

/**
 * Format authors for BibTeX (Last, First and Last, First format)
 */
function formatBibtexAuthors(authors) {
    return (authors || [])
        .filter((a) => a.name && !a.name.includes("Benchmarking Functions"))
        .map((a) => {
            const name = a.name
            const parts = name.split(" ")
            if (parts.length === 1) return name
            const lastName = parts[parts.length - 1]
            const firstNames = parts.slice(0, -1).join(" ")
            return `${lastName}, ${firstNames}`
        })
        .join(" and ")
}

/**
 * Escape special characters for BibTeX
 */
function escapeBibtex(str) {
    if (!str) return ""
    return str
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
}

/**
 * Generate BibTeX entry for a publication
 */
function generateBibtex(pub) {
    const pubType = getPublicationType(pub)
    const key = generateBibtexKey(pub)
    const authors = formatBibtexAuthors(pub.authors)
    const doi = pub.doi ? pub.doi.replace("https://doi.org/", "") : null

    // Map publication type to BibTeX entry type
    const bibtexType =
        {
            conference: "inproceedings",
            journal: "article",
            book: "book",
            chapter: "inbook",
            thesis: "phdthesis",
            preprint: "misc",
        }[pubType] || "misc"

    let bibtex = `@${bibtexType}{${key},\n`
    bibtex += `  title = {${escapeBibtex(pub.title)}},\n`
    bibtex += `  author = {${authors}},\n`
    bibtex += `  year = {${pub.year}},\n`

    // Add venue based on type
    if (pubType === "conference" && pub.journal) {
        bibtex += `  booktitle = {${escapeBibtex(pub.journal)}},\n`
    } else if (pubType === "journal" && pub.journal) {
        bibtex += `  journal = {${escapeBibtex(pub.journal)}},\n`
    } else if (pub.journal) {
        bibtex += `  howpublished = {${escapeBibtex(pub.journal)}},\n`
    }

    // Add volume, issue, pages if available
    if (pub.volume) {
        bibtex += `  volume = {${pub.volume}},\n`
    }
    if (pub.issue) {
        bibtex += `  number = {${pub.issue}},\n`
    }
    if (pub.pages?.first) {
        const pages = pub.pages.last
            ? `${pub.pages.first}--${pub.pages.last}`
            : pub.pages.first
        bibtex += `  pages = {${pages}},\n`
    }

    // Add month if available
    if (pub.month) {
        const months = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
        ]
        bibtex += `  month = {${months[pub.month - 1]}},\n`
    }

    // Add DOI
    if (doi) {
        bibtex += `  doi = {${doi}},\n`
    }

    // Remove trailing comma and close
    bibtex = bibtex.replace(/,\n$/, "\n")
    bibtex += "}"

    return bibtex
}

/**
 * Generate markdown content for a publication
 */
function generateMarkdown(pub) {
    const openalexId = extractOpenAlexId(pub.id)
    const pubType = getPublicationType(pub)
    const tags = getTopics(pub.topics)

    // Build authors list
    const authors = (pub.authors || [])
        .filter((a) => a.name && !a.name.includes("Benchmarking Functions")) // Filter bad data
        .map((a) => `  - "${a.name}"`)
        .join("\n")

    // Build tags list
    const tagsYaml =
        tags.length > 0 ? tags.map((t) => `  - "${t}"`).join("\n") : ""

    // Build DOI (clean URL prefix if present)
    const doi = pub.doi ? pub.doi.replace("https://doi.org/", "") : null

    // Build front matter
    let frontMatter = `---
title: ${escapeYaml(pub.title)}
date: ${pub.date || `${pub.year}-01-01`}
year: ${pub.year}
authors:
${authors}
venue: ${escapeYaml(pub.journal || "")}
type: "${pubType}"
openalexId: "${openalexId}"
citations: ${pub.citations || 0}
isOpenAccess: ${pub.isOpenAccess || false}`

    if (doi) {
        frontMatter += `\ndoi: "${doi}"`
    }

    // Add external URL (use landing page URL when no DOI exists)
    // Note: Hugo's "url" field is reserved for permalink override, so we use "externalUrl"
    const paperUrl = pub.url || (doi ? `https://doi.org/${doi}` : null)
    if (paperUrl) {
        frontMatter += `\nexternalUrl: "${paperUrl}"`
    }

    if (pub.oaUrl) {
        frontMatter += `\noaUrl: "${pub.oaUrl}"`
    }

    if (tagsYaml) {
        frontMatter += `\ntags:\n${tagsYaml}`
    }

    frontMatter += `\n---`

    // Build body
    let body = ""

    if (pub.abstract) {
        body += `\n## Abstract\n\n${pub.abstract}\n`
    }

    // Add links section
    // Priority: DOI > Open Access URL > External URL
    // Only show one primary link to avoid redundancy
    const links = []
    if (doi) {
        links.push(`- [DOI](https://doi.org/${doi})`)
    } else if (pub.url) {
        // Only show Paper URL if there's no DOI
        links.push(`- [Paper URL](${pub.url})`)
    }

    // Open Access PDF is shown separately if different from main link
    if (
        pub.oaUrl &&
        pub.oaUrl !== pub.url &&
        pub.oaUrl !== `https://doi.org/${doi}`
    ) {
        links.push(`- [Open Access PDF](${pub.oaUrl})`)
    }

    if (links.length > 0) {
        body += `\n## Links\n\n${links.join("\n")}\n`
    }

    // Add Citation section with BibTeX
    const bibtex = generateBibtex(pub)
    body += `\n## Citation\n\n\`\`\`bibtex\n${bibtex}\n\`\`\`\n`

    return frontMatter + body
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
}

/**
 * Update only the tags field in an existing markdown file
 * Preserves all other content and modifications
 */
async function updateTagsInFile(filePath, newTags) {
    const content = await fs.readFile(filePath, "utf-8")

    // Build new tags YAML
    const newTagsYaml =
        newTags.length > 0
            ? `tags:\n${newTags.map((t) => `  - "${t}"`).join("\n")}`
            : ""

    // Check if file has existing tags section
    const tagsRegex = /^tags:\n(?:\s+-\s+"[^"]*"\n?)*/m

    let updatedContent
    if (tagsRegex.test(content)) {
        // Replace existing tags
        if (newTagsYaml) {
            updatedContent = content.replace(tagsRegex, newTagsYaml + "\n")
        } else {
            // Remove tags section if no new tags
            updatedContent = content.replace(tagsRegex, "")
        }
    } else if (newTagsYaml) {
        // Add tags before the closing ---
        // Find the end of front matter
        const frontMatterEnd = content.indexOf("\n---", 4)
        if (frontMatterEnd !== -1) {
            updatedContent =
                content.slice(0, frontMatterEnd) +
                "\n" +
                newTagsYaml +
                content.slice(frontMatterEnd)
        } else {
            updatedContent = content
        }
    } else {
        updatedContent = content
    }

    await fs.writeFile(filePath, updatedContent)
}

/**
 * Update tags in all existing paper files
 */
async function updateAllTags() {
    console.log("Updating tags in existing paper files...")
    const data = JSON.parse(await fs.readFile(PUBLICATIONS_FILE, "utf-8"))

    let updated = 0
    let notFound = 0

    for (const pub of data.publications) {
        const openalexId = extractOpenAlexId(pub.id)
        const filePath = path.join(PAPERS_DIR, `${openalexId}.md`)

        if (await fileExists(filePath)) {
            const newTags = getTopics(pub.topics)
            await updateTagsInFile(filePath, newTags)
            console.log(`[+] Updated tags: ${openalexId}.md`)
            updated++
        } else {
            notFound++
        }
    }

    console.log(`\n--- Summary ---`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Not found: ${notFound}`)
}

/**
 * Main function
 */
async function generatePaperPages() {
    try {
        console.log("Reading publications data...")
        const data = JSON.parse(await fs.readFile(PUBLICATIONS_FILE, "utf-8"))

        // Ensure papers directory exists
        await fs.mkdir(PAPERS_DIR, { recursive: true })

        let created = 0
        let skipped = 0

        for (const pub of data.publications) {
            const openalexId = extractOpenAlexId(pub.id)
            const filePath = path.join(PAPERS_DIR, `${openalexId}.md`)

            // Skip if file already exists (preserves manual edits)
            if (await fileExists(filePath)) {
                skipped++
                continue
            }

            // Generate and write markdown
            const markdown = generateMarkdown(pub)
            await fs.writeFile(filePath, markdown)
            console.log(
                `[+] ${openalexId}.md - ${pub.title.substring(0, 50)}...`,
            )
            created++
        }

        console.log(`\n--- Summary ---`)
        console.log(`   Created: ${created}`)
        console.log(`   Skipped (already exist): ${skipped}`)
        console.log(`   Total: ${data.publications.length}`)
    } catch (error) {
        console.error("Error generating paper pages:", error)
        process.exit(1)
    }
}

// Run based on command line args
const args = process.argv.slice(2)

if (args.includes("--update-tags")) {
    updateAllTags()
} else {
    generatePaperPages()
}

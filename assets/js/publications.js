// Publications loading script - Clean and reliable version
console.log("📚 Publications script initializing...")

let allPublications = []
let isLoading = false
let currentFilter = "all"
let featuredPublications = new Set()

// Load featured publications list
async function loadFeaturedPublications() {
    try {
        const response = await fetch('/data/featured-publications.json')
        if (response.ok) {
            const data = await response.json()
            featuredPublications = new Set(data.featured.map(f => f.id))
            console.log(`✨ Loaded ${featuredPublications.size} featured publications`)
        }
    } catch (error) {
        console.warn('⚠️ Featured publications file not found, continuing without featured items')
    }
}

// Main initialization
document.addEventListener("DOMContentLoaded", function () {
    console.log("📋 DOM ready, starting publications load...")
    setTimeout(loadPublications, 100)
})

// Main function to load publications
async function loadPublications() {
    if (isLoading) {
        console.log("⏳ Already loading, skipping...")
        return
    }

    isLoading = true
    console.log("🚀 Loading publications...")

    try {
        // Show loading state
        const loadingEl = document.getElementById("loading-message")
        const errorEl = document.getElementById("error-message")

        if (loadingEl) loadingEl.style.display = "flex"
        if (errorEl) errorEl.style.display = "none"

        // Load from cache (includes venue overrides)
        console.log("💾 Fetching cached publications...")

        // Try multiple potential paths for the cache file
        const cachePaths = [
            "/data/openalex-cache.json", // Hugo processed static files
            "/static/data/openalex-cache.json", // Alternative local path
            "./data/openalex-cache.json", // Relative fallback
        ]

        let response = null
        let lastError = null

        for (const path of cachePaths) {
            try {
                console.log(`🔍 Trying cache path: ${path}`)
                response = await fetch(path)
                if (response.ok) {
                    console.log(`✅ Found cache at: ${path}`)
                    break
                } else {
                    console.log(
                        `❌ Cache not found at: ${path} (${response.status})`,
                    )
                    lastError = new Error(`HTTP ${response.status} at ${path}`)
                }
            } catch (error) {
                console.log(
                    `❌ Error fetching from: ${path} - ${error.message}`,
                )
                lastError = error
            }
        }

        if (!response || !response.ok) {
            throw (
                lastError ||
                new Error("Failed to load publications from any cache path")
            )
        }

        const data = await response.json()
        let publications = data.results || []

        console.log(`✅ Loaded ${publications.length} publications`)

        // Update last updated timestamp if available
        if (data.meta && data.meta.lastUpdated) {
            updateLastUpdatedDisplay(data.meta.lastUpdated)
        }

        // Filter out thesis and excluded publications
        const originalCount = publications.length
        publications = publications.filter((pub) => {
            // Check if marked for exclusion in venue overrides
            if (pub._venue_override?.exclude) {
                console.log(
                    `🚫 Excluding: ${pub.title || pub.display_name} (${
                        pub._venue_override.reason || "marked for exclusion"
                    })`,
                )
                return false
            }

            // Check for thesis type
            if (
                pub.type_crossref === "dissertation" ||
                pub.type === "dissertation" ||
                pub.type_crossref === "thesis" ||
                pub.type === "thesis"
            ) {
                console.log(
                    `🚫 Excluding thesis: ${pub.title || pub.display_name}`,
                )
                return false
            }

            // Check venue for thesis indicators
            const venue = pub.primary_location?.source?.display_name || ""
            if (
                venue.toLowerCase().includes("dissertation") ||
                venue.toLowerCase().includes("thesis") ||
                (venue.toLowerCase().includes("university") &&
                    (pub.type_crossref === "book" || pub.type === "book"))
            ) {
                console.log(
                    `🚫 Excluding thesis by venue: ${
                        pub.title || pub.display_name
                    }`,
                )
                return false
            }

            return true
        })

        console.log(
            `📊 Filtered: ${originalCount} → ${
                publications.length
            } publications (excluded ${
                originalCount - publications.length
            } thesis/excluded items)`,
        )

        if (publications.length === 0) {
            throw new Error("No publications found after filtering")
        }

        // Store globally for filtering
        allPublications = publications

        // Hide loading
        if (loadingEl) loadingEl.style.display = "none"

        // Load featured publications before displaying
        await loadFeaturedPublications()

        // Display publications
        displayPublications(publications)
        updateStats(publications)
        setupFilters()

        // Show stats and filters
        if (document.getElementById("publications-stats")) {
            document.getElementById("publications-stats").style.display = "flex"
        }
        if (document.getElementById("publications-filters")) {
            document.getElementById("publications-filters").style.display =
                "flex"
        }

        console.log("🎉 Publications loaded successfully!")
        isLoading = false
    } catch (error) {
        console.error("❌ Error loading publications from cache:", error)

        // Try fallback to publications.json
        try {
            console.log("🔄 Trying fallback to publications.json...")
            const fallbackResponse = await fetch("/data/publications.json")

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                console.log("✅ Loaded from fallback publications.json")

                // Convert the old format to the new format if needed
                let publications =
                    fallbackData.publications || fallbackData.results || []

                if (publications.length > 0) {
                    console.log(
                        `📊 Fallback loaded ${publications.length} publications`,
                    )

                    // Store globally for filtering
                    allPublications = publications

                    // Hide loading
                    if (loadingEl) loadingEl.style.display = "none"

                    // Display publications
                    displayPublications(publications)

                    // Update last updated display (fallback - no specific timestamp available)
                    updateLastUpdatedDisplay(null)
                    updateStats(publications)
                    setupFilters()

                    // Show stats and filters
                    if (document.getElementById("publications-stats")) {
                        document.getElementById(
                            "publications-stats",
                        ).style.display = "flex"
                    }
                    if (document.getElementById("publications-filters")) {
                        document.getElementById(
                            "publications-filters",
                        ).style.display = "flex"
                    }

                    console.log(
                        "🎉 Publications loaded from fallback successfully!",
                    )
                    isLoading = false
                    return
                }
            }
        } catch (fallbackError) {
            console.error("❌ Fallback also failed:", fallbackError)
        }

        // If both methods fail, show error
        isLoading = false

        // Hide loading
        if (loadingEl) loadingEl.style.display = "none"

        // Show error
        const errorEl = document.getElementById("error-message")
        if (errorEl) {
            errorEl.style.display = "block"
            errorEl.innerHTML = `<p>Error loading publications: ${error.message}</p><p>Fallback attempt also failed. Please try again later.</p><button onclick="loadPublications()" style="margin-top: 10px; padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>`
        }
    }
}

// Render individual publication card
function renderPublicationCard(pub, isFeatured = false) {
    const title = pub.title || "Untitled"
    const year = pub.publication_year || "Unknown"

    // Process authors with proper capitalization and highlighting
    const processedAuthors = pub.authorships?.map((a) => {
        let authorName = a.author?.display_name || "Unknown Author"

        // Capitalize author name properly
        authorName = authorName
            .split(" ")
            .map((word) => {
                // Handle special cases for Portuguese/Brazilian names
                if (
                    word.toLowerCase() === "de" ||
                    word.toLowerCase() === "da" ||
                    word.toLowerCase() === "do" ||
                    word.toLowerCase() === "dos" ||
                    word.toLowerCase() === "das" ||
                    word.toLowerCase() === "e"
                ) {
                    return word.toLowerCase()
                }
                // Handle initials (single letters followed by period)
                if (word.length <= 2 && word.includes(".")) {
                    return word.toUpperCase()
                }
                // Regular capitalization
                return (
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLowerCase()
                )
            })
            .join(" ")

        // Bold João Carlos N. Bittencourt (check for variations)
        if (
            authorName.includes("João Carlos") &&
            authorName.includes("Bittencourt")
        ) {
            // Normalize to consistent format
            authorName = "João Carlos N. Bittencourt"
            return `<strong>${authorName}</strong>`
        }

        return authorName
    }) || ["Unknown authors"]

    const authors = processedAuthors.join(", ")

    const venue =
        pub._venue_override?.venue_name ||
        pub.primary_location?.source?.display_name ||
        pub.host_venue?.display_name ||
        "Unknown venue"
    const doi = pub.doi
    const citations = pub.cited_by_count || 0
    const isOpenAccess = pub.open_access?.is_oa || false
    const type = pub.type_crossref || pub.type || "article"

    // Extract volume, issue, pages for journals
    const biblio = pub.biblio || {}
    const volume = biblio.volume
    const issue = biblio.issue
    const firstPage = biblio.first_page
    const lastPage = biblio.last_page

    // Extract conference location if available
    const venueLocation = pub._venue_override?.venue_location

    // Format venue - simple uppercase without bold
    const formattedVenue = venue.toUpperCase()

    // Use categorization function
    const category = categorizeByType(pub)

    return `
        <div class="publication-item ${isFeatured ? 'is-featured' : ''}"
             data-type="${category}"
             data-open-access="${isOpenAccess}"
             data-citations="${citations}"
             data-publication-id="${pub.id}">
          <div class="publication-header">
            <div class="publication-title">
              ${title}
            </div>
          </div>
          <div class="publication-authors">${authors}</div>
          <div class="publication-venue-line">
            <span class="venue-name">${formattedVenue}</span>
            ${citations > 0 ? `<span class="citation-count">CITED BY ${citations}</span>` : ""}
            ${isOpenAccess ? '<span class="open-access-badge">OPEN ACCESS</span>' : ""}
            ${doi ? `<a href="${doi.startsWith("http") ? doi : `https://doi.org/${doi}`}" target="_blank" rel="noopener" class="doi-link">DOI</a>` : ""}
          </div>
        </div>
    `
}

// Display featured publications section
function displayFeaturedPublications(publications) {
    const featured = publications.filter(pub => featuredPublications.has(pub.id))

    if (featured.length === 0) {
        console.log("📌 No featured publications to display")
        return ''
    }

    console.log(`📌 Displaying ${featured.length} featured publications`)

    let html = `
        <div id="featured" class="publications-section">
            <h2 class="section-heading">Selected Publications</h2>
            <div class="publications-list">
    `

    featured.forEach(pub => {
        html += renderPublicationCard(pub, true)
    })

    html += `</div></div>`
    return html
}

// Display publications grouped by year and type
function displayPublications(publications) {
    console.log(`📊 Displaying ${publications.length} publications...`)

    const contentEl = document.getElementById("publications-content")
    if (!contentEl) {
        console.error("❌ Publications content element not found")
        return
    }

    let html = ''

    // 1. Featured publications section at top
    html += displayFeaturedPublications(publications)

    // 2. Group by year, then by type
    const groupedByYear = {}

    publications.forEach((pub) => {
        const year = pub.publication_year || "Unknown"
        if (!groupedByYear[year]) {
            groupedByYear[year] = {
                journals: [],
                conferences: [],
                books: [],
                preprints: [],
                other: []
            }
        }

        const category = categorizeByType(pub)
        groupedByYear[year][category].push(pub)
    })

    // Sort years descending
    const years = Object.keys(groupedByYear).sort((a, b) => {
        if (a === "Unknown") return 1
        if (b === "Unknown") return -1
        return parseInt(b) - parseInt(a)
    })

    // 3. Render each year with type subgroups
    html += '<div id="publications-by-year" class="publications-section">'

    years.forEach((year) => {
        html += `<div id="year-${year}" class="year-group" data-year="${year}">
                   <h2 class="year-heading">${year}</h2>`

        const yearData = groupedByYear[year]

        // Render types in specific order
        const typeOrder = [
            { key: 'journals', label: 'Journal Articles' },
            { key: 'conferences', label: 'Conference Papers' },
            { key: 'books', label: 'Books & Chapters' },
            { key: 'preprints', label: 'Preprints' }
        ]

        typeOrder.forEach(({ key, label }) => {
            if (yearData[key].length > 0) {
                html += `<div class="type-group type-${key}">
                          <h3 class="type-heading">${label}</h3>
                          <div class="publications-list">`

                yearData[key].forEach((pub) => {
                    html += renderPublicationCard(pub, false)
                })

                html += '</div></div>' // end publications-list and type-group
            }
        })

        html += '</div>' // end year-group
    })

    html += '</div>' // end publications-by-year

    contentEl.innerHTML = html
    console.log("✅ Publications displayed with featured section and type grouping")

    // Attach modal listeners after DOM is updated
    setTimeout(() => {
        attachModalListeners()
    }, 100)
}

// Update statistics
function updateStats(publications) {
    const totalPapers = publications.length
    const totalCitations = publications.reduce(
        (sum, pub) => sum + (pub.cited_by_count || 0),
        0,
    )
    const openAccessCount = publications.filter(
        (pub) => pub.open_access?.is_oa,
    ).length

    // Calculate h-index
    const citations = publications
        .map((pub) => pub.cited_by_count || 0)
        .sort((a, b) => b - a)
    let hIndex = 0
    for (let i = 0; i < citations.length; i++) {
        if (citations[i] >= i + 1) {
            hIndex = i + 1
        } else {
            break
        }
    }

    // Update DOM
    const totalPapersEl = document.getElementById("total-papers")
    const totalCitationsEl = document.getElementById("total-citations")
    const hIndexEl = document.getElementById("h-index")
    const openAccessEl = document.getElementById("open-access-count")

    if (totalPapersEl) totalPapersEl.textContent = totalPapers
    if (totalCitationsEl) totalCitationsEl.textContent = totalCitations
    if (hIndexEl) hIndexEl.textContent = hIndex
    if (openAccessEl) openAccessEl.textContent = openAccessCount
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-button")

    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Update active state
            filterButtons.forEach((btn) => btn.classList.remove("active"))
            this.classList.add("active")

            // Get filter value
            currentFilter = this.dataset.filter

            // Apply filter
            filterPublications()
        })
    })
}

// Filter publications based on current filter
function filterPublications() {
    const publicationItems = document.querySelectorAll(".publication-item")
    const yearGroups = document.querySelectorAll(".year-group")
    const typeGroups = document.querySelectorAll(".type-group")

    // Track visible items per year and per type group
    const visibleYears = new Set()
    const visibleTypeGroups = new Set()

    publicationItems.forEach((item) => {
        const type = item.dataset.type
        const isOpenAccess = item.dataset.openAccess === "true"
        const citations = parseInt(item.dataset.citations) || 0

        let show = true

        switch (currentFilter) {
            case "journals":
                show = type === "journals"
                break
            case "conferences":
                show = type === "conferences"
                break
            case "books":
                show = type === "books"
                break
            case "open-access":
                show = isOpenAccess
                break
            case "highly-cited":
                show = citations > 30
                break
            default: // 'all'
                show = true
        }

        item.style.display = show ? "block" : "none"

        if (show) {
            const yearGroup = item.closest(".year-group")
            const typeGroup = item.closest(".type-group")

            if (yearGroup) visibleYears.add(yearGroup.id)
            if (typeGroup) visibleTypeGroups.add(typeGroup)
        }
    })

    // Hide/show type groups based on visibility
    typeGroups.forEach((group) => {
        group.style.display = visibleTypeGroups.has(group) ? "block" : "none"
    })

    // Hide/show year groups based on visibility
    yearGroups.forEach((group) => {
        group.style.display = visibleYears.has(group.id) ? "block" : "none"
    })
}

// Function to update the last updated display
function updateLastUpdatedDisplay(lastUpdatedISO) {
    const lastUpdatedEl = document.getElementById("last-updated")
    if (!lastUpdatedEl) return

    try {
        const lastUpdatedDate = new Date(lastUpdatedISO)
        const now = new Date()

        // Calculate time difference
        const timeDiff = now - lastUpdatedDate
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))

        let relativeTime
        if (daysDiff === 0) {
            if (hoursDiff === 0) {
                relativeTime = "less than an hour ago"
            } else if (hoursDiff === 1) {
                relativeTime = "1 hour ago"
            } else {
                relativeTime = `${hoursDiff} hours ago`
            }
        } else if (daysDiff === 1) {
            relativeTime = "1 day ago"
        } else if (daysDiff < 30) {
            relativeTime = `${daysDiff} days ago`
        } else {
            // For older dates, show the actual date
            relativeTime = lastUpdatedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        }

        lastUpdatedEl.innerHTML = `<em>Last updated: ${relativeTime}</em>`
    } catch (error) {
        console.error("Error parsing last updated date:", error)
        lastUpdatedEl.innerHTML = `<em>Last updated: ${lastUpdatedISO}</em>`
    }
}

// Categorize publication by type for grouping
function categorizeByType(publication) {
    const type = publication.type_crossref || publication.type || "article"
    const venue = publication.primary_location?.source?.display_name || ""
    const doi = publication.doi || ""

    // Springer proceedings detection
    const isSpringerProceedings = doi && doi.includes("10.1007/978-")
    const isLectureNotes = venue.toLowerCase().includes("lecture notes")
    const isProceedingsVenue = venue.toLowerCase().includes("proceedings") ||
        venue.toLowerCase().includes("conference") ||
        venue.toLowerCase().includes("symposium") ||
        venue.toLowerCase().includes("workshop")

    // Preprint detection
    const isPreprint = publication.publicationType === "posted-content" ||
        venue.toLowerCase().includes("arxiv") ||
        venue.toLowerCase().includes("biorxiv") ||
        venue.toLowerCase().includes("medrxiv") ||
        venue.toLowerCase().includes("preprint") ||
        venue.toLowerCase().includes("research square") ||
        venue.toLowerCase().includes("ssrn") ||
        venue.toLowerCase().includes("researchgate")

    // Book chapter detection
    const isBookChapter = type.toLowerCase().includes("book-chapter") &&
        !isSpringerProceedings && !isLectureNotes && !isProceedingsVenue

    // Journal detection
    const isJournal = !isSpringerProceedings && !isLectureNotes &&
        !isProceedingsVenue && !isBookChapter &&
        (type.toLowerCase().includes("journal") || venue.toLowerCase().includes("journal"))

    // Conference detection
    const isConference = isSpringerProceedings || isLectureNotes || isProceedingsVenue ||
        ((type.toLowerCase().includes("conference") || type.toLowerCase().includes("proceedings")) && !isBookChapter)

    if (isPreprint) return 'preprints'
    if (isJournal) return 'journals'
    if (isConference) return 'conferences'
    if (isBookChapter) return 'books'
    return 'other'
}

// Abstract Modal Functionality
function createAbstractModal() {
    // Check if modal already exists
    if (document.getElementById('abstract-modal')) {
        return
    }

    const modal = document.createElement('div')
    modal.id = 'abstract-modal'
    modal.className = 'abstract-modal'
    modal.innerHTML = `
        <div class="abstract-modal-content">
            <button class="abstract-modal-close" aria-label="Close modal">&times;</button>
            <div class="abstract-modal-header">
                <h2 class="abstract-modal-title" id="modal-title"></h2>
                <p class="abstract-modal-meta" id="modal-meta"></p>
            </div>
            <div class="abstract-modal-body">
                <p class="abstract-modal-label">Abstract</p>
                <p class="abstract-modal-text" id="modal-abstract"></p>
            </div>
            <div class="abstract-modal-footer" id="modal-footer"></div>
        </div>
    `

    document.body.appendChild(modal)

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAbstractModal()
        }
    })

    // Close modal on close button click
    const closeBtn = modal.querySelector('.abstract-modal-close')
    closeBtn.addEventListener('click', closeAbstractModal)

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeAbstractModal()
        }
    })
}

function openAbstractModal(pub) {
    createAbstractModal()

    const modal = document.getElementById('abstract-modal')
    const titleEl = document.getElementById('modal-title')
    const metaEl = document.getElementById('modal-meta')
    const abstractEl = document.getElementById('modal-abstract')
    const footerEl = document.getElementById('modal-footer')

    // Set title
    titleEl.textContent = pub.title || 'Untitled'

    // Set meta (authors and year)
    const authors = pub.authorships?.map(a => a.author?.display_name).join(', ') || 'Unknown authors'
    const year = pub.publication_year || 'Unknown year'
    metaEl.textContent = `${authors} (${year})`

    // Set abstract
    if (pub.abstract_inverted_index) {
        // Reconstruct abstract from inverted index
        const abstract = reconstructAbstract(pub.abstract_inverted_index)
        abstractEl.textContent = abstract
        abstractEl.className = 'abstract-modal-text'
    } else {
        abstractEl.textContent = 'Abstract not available for this publication.'
        abstractEl.className = 'abstract-not-available'
    }

    // Set footer links
    footerEl.innerHTML = ''
    if (pub.doi) {
        const doiUrl = pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`
        footerEl.innerHTML += `<a href="${doiUrl}" target="_blank" rel="noopener" class="abstract-modal-link">View on Publisher Site →</a>`
    }

    if (pub.open_access?.oa_url) {
        footerEl.innerHTML += `<a href="${pub.open_access.oa_url}" target="_blank" rel="noopener" class="abstract-modal-link">Open Access Version →</a>`
    }

    // Show modal
    setTimeout(() => {
        modal.classList.add('active')
        document.body.style.overflow = 'hidden' // Prevent background scrolling
    }, 10)
}

function closeAbstractModal() {
    const modal = document.getElementById('abstract-modal')
    if (modal) {
        modal.classList.remove('active')
        document.body.style.overflow = '' // Restore scrolling
    }
}

function reconstructAbstract(invertedIndex) {
    // OpenAlex provides abstracts as inverted index: {"word": [position1, position2, ...]}
    // We need to reconstruct the original text
    const words = []

    for (const [word, positions] of Object.entries(invertedIndex)) {
        positions.forEach(pos => {
            words[pos] = word
        })
    }

    return words.join(' ')
}

function attachModalListeners() {
    // Attach click listeners to all publication titles
    const titles = document.querySelectorAll('.publication-title')

    titles.forEach(titleEl => {
        // Remove any existing listeners by cloning the element
        const newTitleEl = titleEl.cloneNode(true)
        titleEl.parentNode.replaceChild(newTitleEl, titleEl)

        newTitleEl.addEventListener('click', () => {
            const publicationItem = newTitleEl.closest('.publication-item')
            const publicationId = publicationItem.dataset.publicationId

            // Find the publication in allPublications array
            const pub = allPublications.find(p => p.id === publicationId)

            if (pub) {
                openAbstractModal(pub)
            }
        })
    })

    console.log(`📄 Attached modal listeners to ${titles.length} publication titles`)
}

// Expose to global scope for retry button
window.loadPublications = loadPublications

console.log("📚 Publications script ready")

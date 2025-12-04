// Publications page side navigation behavior
document.addEventListener("DOMContentLoaded", () => {
    // Wait for publications to be loaded and rendered
    const checkPublicationsLoaded = setInterval(() => {
        const sections = document.querySelectorAll('.publications-section, .year-group')
        if (sections.length > 0) {
            clearInterval(checkPublicationsLoaded)
            initializePublicationsNav()
        }
    }, 100)

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkPublicationsLoaded), 5000)
})

function initializePublicationsNav() {
    const sidenav = document.querySelector('.publications-sidenav')
    if (!sidenav) {
        console.warn('⚠️ Publications sidenav element not found')
        return
    }

    // Build nav links dynamically based on rendered sections
    const yearGroups = document.querySelectorAll('.year-group')
    const featuredSection = document.getElementById('featured')

    let navHTML = ''

    // Add featured link if section exists
    if (featuredSection) {
        navHTML += `
            <a class="publications-sidenav-link is-active" href="#featured">
                <span class="publications-sidenav-label">Selected</span>
                <span class="publications-sidenav-bar" aria-hidden="true"></span>
            </a>
        `
    }

    // Add year links
    yearGroups.forEach(group => {
        const year = group.dataset.year
        const yearId = group.id
        navHTML += `
            <a class="publications-sidenav-link" href="#${yearId}">
                <span class="publications-sidenav-label">${year}</span>
                <span class="publications-sidenav-bar" aria-hidden="true"></span>
            </a>
        `
    })

    sidenav.innerHTML = navHTML

    // Set up scroll behavior
    setupNavigationBehavior()

    console.log('✅ Publications navigation initialized')
}

function setupNavigationBehavior() {
    const navLinks = Array.from(document.querySelectorAll(".publications-sidenav-link"))
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean)

    const setActive = (id) => {
        navLinks.forEach(link => {
            const isMatch = link.getAttribute("href") === `#${id}`
            link.classList.toggle("is-active", isMatch)
            if (isMatch) {
                link.setAttribute("aria-current", "location")
            } else {
                link.removeAttribute("aria-current")
            }
        })
    }

    const smoothScroll = (target) => {
        const offset = 88
        const top = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: "smooth" })
    }

    // Click handlers
    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault()
            const target = document.querySelector(link.getAttribute("href"))
            if (target) {
                smoothScroll(target)
                setActive(target.id)
            }
        })
    })

    // Intersection observer for auto-highlighting
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id)
                    }
                })
            },
            {
                rootMargin: "-35% 0px -45% 0px",
                threshold: [0, 0.25, 0.5, 1]
            }
        )

        sections.forEach(section => observer.observe(section))
    } else {
        // Fallback for browsers without IntersectionObserver
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight * 0.35
            sections.forEach(section => {
                const { top, height } = section.getBoundingClientRect()
                const offsetTop = top + window.scrollY
                if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
                    setActive(section.id)
                }
            })
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()
    }
}

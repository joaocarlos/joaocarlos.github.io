// About page side navigation behavior
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = Array.from(
        document.querySelectorAll(".about-sidenav-link"),
    )
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean)

    const setActive = (id) => {
        navLinks.forEach((link) => {
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
        const top =
            target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: "smooth" })
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault()
            const target = document.querySelector(link.getAttribute("href"))
            if (target) {
                smoothScroll(target)
                setActive(target.id)
            }
        })
    })

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id)
                    }
                })
            },
            {
                rootMargin: "-35% 0px -45% 0px",
                threshold: [0, 0.25, 0.5, 1],
            },
        )

        sections.forEach((section) => observer.observe(section))
    } else {
        const handleScroll = () => {
            const scrollPosition =
                window.scrollY + window.innerHeight * 0.35
            sections.forEach((section) => {
                const { top, height } = section.getBoundingClientRect()
                const offsetTop = top + window.scrollY
                if (
                    scrollPosition >= offsetTop &&
                    scrollPosition < offsetTop + height
                ) {
                    setActive(section.id)
                }
            })
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()
    }
})

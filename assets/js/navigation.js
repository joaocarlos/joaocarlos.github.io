// Global navigation behavior
class SiteNavigation {
    constructor() {
        this.mobileMenu = document.getElementById("mobile-menu-overlay")
        this.mobileDrawer = document.getElementById("mobile-menu-drawer")
        this.init()
    }

    init() {
        // Mobile menu open triggers
        document.querySelectorAll('[data-action="open-menu"]').forEach((btn) => {
            btn.addEventListener("click", () => this.openMobileMenu())
        })

        // Mobile menu close triggers
        document.querySelectorAll('[data-action="close-menu"]').forEach((btn) => {
            btn.addEventListener("click", () => this.closeMobileMenu())
        })

        // Legacy onclick support (backward compatibility)
        window.openMobileMenu = () => this.openMobileMenu()
        window.closeMobileMenu = () => this.closeMobileMenu()
    }

    openMobileMenu() {
        if (this.mobileMenu && this.mobileDrawer) {
            this.mobileMenu.classList.add("mobile-menu-open")
            this.mobileDrawer.classList.add("mobile-menu-drawer-open")
            document.body.style.overflow = "hidden"
        }
    }

    closeMobileMenu() {
        if (this.mobileMenu && this.mobileDrawer) {
            this.mobileMenu.classList.remove("mobile-menu-open")
            this.mobileDrawer.classList.remove("mobile-menu-drawer-open")
            document.body.style.overflow = ""
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new SiteNavigation())
} else {
    new SiteNavigation()
}

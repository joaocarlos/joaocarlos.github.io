// Tailwind theme mapping to existing PaperMod tokens (assets/css/core/theme-vars.css)
// This keeps sandbox pages on-brand while you explore Tailwind.
const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./layouts/**/*.{html,js}", "./content/**/*.{md,html}", "./assets/**/*.{html,js}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: "#ffffff",
                    entry: "#ffffff",
                    primary: "rgb(30, 30, 30)",
                    secondary: "rgb(108, 108, 108)",
                    tertiary: "rgb(214, 214, 214)",
                    gray: "rgb(165, 165, 165)",
                    content: "rgb(30, 30, 30)",
                    border: "rgb(238, 238, 238)",
                    accent: "#6a7ba2",
                    accentLight: "#cbd1de",
                    darkBg: "rgb(29, 30, 32)",
                    darkEntry: "rgb(46, 46, 51)",
                    darkPrimary: "rgb(218, 218, 219)",
                    darkSecondary: "rgb(155, 156, 157)",
                    darkBorder: "rgb(51, 51, 51)",
                },
                slate: colors.slate,
            },
            spacing: {
                gap: "24px",
                "content-gap": "20px",
                header: "44px",
                footer: "70px",
            },
            borderRadius: {
                brand: "8px",
            },
            maxWidth: {
                nav: "1024px",
                main: "720px",
            },
            fontFamily: {
                sans: ['"IBM Plex Sans"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
                serif: ["Merriweather", "Georgia", "serif"],
            },
            fontSize: {
                base: ["18px", "1.45"],
                h1: ["25px", "1.3"],
                entry: ["15px", "1.45"],
                header: ["16px", "1.4"],
                footer: ["13px", "1.45"],
            },
            lineHeight: {
                snugger: "1.35",
            },
            boxShadow: {
                card: "0 18px 48px -26px rgba(17, 24, 39, 0.28)",
                soft: "0 12px 28px -22px rgba(17, 24, 39, 0.25)",
            },
        },
    },
    plugins: [],
}

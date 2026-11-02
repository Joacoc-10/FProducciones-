/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        bg: channel("bg"),
        surface: channel("surface"),
        "surface-2": channel("surface-2"),
        text: channel("text"),
        muted: channel("muted"),
        brand: { DEFAULT: channel("brand"), hi: channel("brand-hi") },
        light: channel("light"),
      },
      borderColor: { DEFAULT: "rgb(255 255 255 / 0.09)" },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        meter: {
          "0%, 100%": { transform: "scaleY(0.25)" },
          "50%": { transform: "scaleY(1)" },
        },
        // Solo opacidad y sin fill final: un transform activo convertiría a este
        // contenedor en el bloque contenedor de los elementos fixed (rompe el pin de GSAP).
        // Entrada del hero en CSS puro: no espera a JS (mejora el LCP)
        "hero-in": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "none" },
        },
        "page-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        meter: "meter 1.6s ease-in-out infinite",
        "hero-in": "hero-in 0.9s cubic-bezier(0.22,1,0.36,1) backwards",
        "page-in": "page-in 0.3s cubic-bezier(0.22,1,0.36,1) backwards",
      },
    },
  },
  plugins: [
    // Pantallas anchas y apaisadas: el visual 16:9 puede ocupar toda la sección.
    // Variante propia (no `screens`: una pantalla raw rompe las variantes max-*).
    ({ addVariant }) => addVariant("wide", "@media (min-width: 768px) and (min-aspect-ratio: 5/4)"),
    // Menú de la navbar: distribuciones más compactas cuando la altura disponible es corta.
    ({ addVariant }) => addVariant("short", "@media (max-height: 640px), (max-width: 767px) and (max-height: 900px)"),
    ({ addVariant }) => addVariant("tight", "@media (max-width: 767px) and (orientation: portrait) and (max-height: 700px)"),
    ({ addVariant }) => addVariant("cramped", "@media (max-width: 767px) and (orientation: portrait) and (max-height: 560px)"),
    ({ addVariant }) => addVariant("land", "@media (orientation: landscape) and (max-height: 560px)"),
  ],
};

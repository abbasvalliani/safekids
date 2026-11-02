// Tailwind v4 runs as its own PostCSS plugin and handles vendor prefixing,
// so autoprefixer is no longer needed. The theme lives in src/app/global.css.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

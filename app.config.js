// The web build's base path. GitHub Pages serves the app under /German-Citizenship-App
// (app.json); lid.utpaldas.com serves it at the root, so vercel.json builds
// with WEB_BASE_URL set to an empty string.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.WEB_BASE_URL ?? config.experiments?.baseUrl,
  },
});

const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Save Chrome inside node_modules so Render's caching system persists it across deploys
  cacheDirectory: join(__dirname, 'node_modules', '.puppeteer_cache'),
};

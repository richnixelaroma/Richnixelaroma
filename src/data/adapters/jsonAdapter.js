const fs = require('fs');
const { FILES, writeJson, readJson } = require('../jsonStore');

const DEFAULTS = Object.freeze({ products: [], coupons: [], orders: [], config: {} });

function initialize(defaults = DEFAULTS) {
  fs.mkdirSync(require('path').dirname(FILES.products), { recursive: true });
  for (const [key, filePath] of Object.entries(FILES)) {
    if (!fs.existsSync(filePath)) writeJson(filePath, defaults[key]);
  }
}

function get(key, fallback = DEFAULTS[key]) {
  return readJson(FILES[key], fallback);
}

function set(key, value) {
  if (!FILES[key]) throw new Error(`Unknown data collection: ${key}`);
  writeJson(FILES[key], value);
}

module.exports = { initialize, get, set };

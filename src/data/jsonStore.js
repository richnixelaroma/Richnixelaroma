const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILES = Object.freeze({
  products: path.join(DATA_DIR, 'products.json'),
  coupons: path.join(DATA_DIR, 'coupons.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  config: path.join(DATA_DIR, 'site-config.json')
});

function readJson(filePath, fallback) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw new Error(`Could not read valid JSON from ${path.basename(filePath)}: ${error.message}`);
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporaryPath, filePath);
}

module.exports = { FILES, readJson, writeJson };

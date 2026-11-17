const { FILES, readJson, writeJson } = require('./jsonStore');
const { config: env } = require('../config');

const DEFAULT_CONFIG = {
  siteName: 'Richnixelaroma',
  supportPhone: '+91 9099401987',
  upiId: env.upiId,
  codEnabled: true,
  gujaratOnly: true,
  tagline: 'Premium perfumes and attars curated with luxury, heritage, and elegance.'
};

function initializeData() {
  const initial = {
    products: [],
    coupons: [],
    orders: [],
    config: DEFAULT_CONFIG
  };
  for (const [key, filePath] of Object.entries(FILES)) {
    if (!require('fs').existsSync(filePath)) writeJson(filePath, initial[key]);
  }
}

function readList(key) {
  const value = readJson(FILES[key], []);
  if (!Array.isArray(value)) throw new Error(`${key}.json must contain a JSON array.`);
  return value;
}

const getProducts = () => readList('products');
const saveProducts = (value) => writeJson(FILES.products, value);
const getCoupons = () => readList('coupons');
const saveCoupons = (value) => writeJson(FILES.coupons, value);
const getOrders = () => readList('orders');
const saveOrders = (value) => writeJson(FILES.orders, value);
function getConfig() {
  const value = readJson(FILES.config, {});
  return { ...DEFAULT_CONFIG, ...value, upiId: value.upiId || env.upiId };
}
const saveConfig = (value) => writeJson(FILES.config, value);

module.exports = { initializeData, getProducts, saveProducts, getCoupons, saveCoupons, getOrders, saveOrders, getConfig, saveConfig };

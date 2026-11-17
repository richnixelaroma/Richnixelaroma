const jsonAdapter = require('./adapters/jsonAdapter');
const { config: env } = require('../config');

// Adapter contract: initialize(defaults), get(collection, fallback), set(collection, value).
// A SQLite/PostgreSQL adapter can implement this contract without changing routes/services.
const adapterName = (process.env.DATA_ADAPTER || 'json').toLowerCase();
const adapters = { json: jsonAdapter };
if (!adapters[adapterName]) {
  throw new Error(`Unsupported DATA_ADAPTER "${adapterName}". Available adapters: ${Object.keys(adapters).join(', ')}.`);
}
const adapter = adapters[adapterName];

const DEFAULT_CONFIG = {
  siteName: 'Richnixelaroma',
  supportPhone: '+91 9099401987',
  upiId: env.upiId,
  codEnabled: true,
  gujaratOnly: true,
  tagline: 'Premium perfumes and attars curated with luxury, heritage, and elegance.'
};
const DEFAULTS = { products: [], coupons: [], orders: [], config: DEFAULT_CONFIG };

function initializeData() {
  adapter.initialize(DEFAULTS);
}

function readList(key) {
  const value = adapter.get(key, []);
  if (!Array.isArray(value)) throw new Error(`${key} data must be an array.`);
  return value;
}

const getProducts = () => readList('products');
const saveProducts = (value) => adapter.set('products', value);
const getCoupons = () => readList('coupons');
const saveCoupons = (value) => adapter.set('coupons', value);
const getOrders = () => readList('orders');
const saveOrders = (value) => adapter.set('orders', value);
function getConfig() {
  const value = adapter.get('config', {});
  return { ...DEFAULT_CONFIG, ...(value || {}), upiId: (value && value.upiId) || env.upiId };
}
const saveConfig = (value) => adapter.set('config', value);

module.exports = { initializeData, getProducts, saveProducts, getCoupons, saveCoupons, getOrders, saveOrders, getConfig, saveConfig, adapterName };

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value || value.includes('CHANGE_ME')) throw new Error(`Set ${name} in your .env file before starting the server.`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';
const config = Object.freeze({
  port: Number(process.env.PORT) || 3000,
  isProduction,
  sessionSecret: required('SESSION_SECRET'),
  adminUsername: required('ADMIN_USERNAME'),
  adminPassword: required('ADMIN_PASSWORD'),
  upiId: process.env.UPI_ID || '',
  trustProxy: process.env.TRUST_PROXY === 'true'
});

if (config.sessionSecret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');

module.exports = { config };

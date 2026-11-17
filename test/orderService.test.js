const test = require('node:test');
const assert = require('node:assert/strict');
const { placeOrder } = require('../src/services/orderService');

const context = {
  products: [{ id: 'p1', name: 'Oud', price: 1000, stock: 5, slug: 'oud' }],
  coupons: [{ code: 'TEN', type: 'percent', value: 10, active: true }],
  siteConfig: { gujaratOnly: true, codEnabled: true, upiId: 'shop@upi' }
};
const customer = { name: 'A User', phone: '9099401987', address: '1 Main Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', paymentMethod: 'cod' };

test('prices order items from catalog, not client-supplied prices', () => {
  const order = placeOrder({ ...customer, cart: [{ id: 'p1', quantity: 2, price: 1 }] }, context);
  assert.equal(order.subtotal, 2000);
  assert.equal(order.items[0].price, 1000);
});

test('rejects invalid quantities and unsupported state', () => {
  assert.throws(() => placeOrder({ ...customer, cart: [{ id: 'p1', quantity: 0 }] }, context), /invalid product or quantity/);
  assert.throws(() => placeOrder({ ...customer, state: 'Maharashtra', cart: [{ id: 'p1', quantity: 1 }] }, context), /only within Gujarat/);
});

test('validates stock and applies an active coupon', () => {
  const order = placeOrder({ ...customer, coupon: 'TEN', cart: [{ id: 'p1', quantity: 2 }] }, context);
  assert.equal(order.discount, 200);
  assert.equal(order.total, 1800);
  assert.throws(() => placeOrder({ ...customer, cart: [{ id: 'p1', quantity: 6 }] }, context), /enough stock/);
});

test('uses the same generated order ID in UPI payment reference', () => {
  const order = placeOrder({ ...customer, paymentMethod: 'upi', cart: [{ id: 'p1', quantity: 1 }] }, context);
  assert.match(order.paymentLink, new RegExp(encodeURIComponent(order.id)));
});

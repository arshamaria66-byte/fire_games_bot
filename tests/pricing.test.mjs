import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubtotal, discountPercent, isValidQuantity } from '../lib/pricing.mjs';
test('cart subtotal multiplies Toman unit prices by quantities',()=>assert.equal(calculateSubtotal([{price_toman:2450000,quantity:2},{price_toman:1900000,quantity:1}]),6800000));
test('empty cart subtotal is zero',()=>assert.equal(calculateSubtotal([]),0));
test('cart quantities must be integers between 1 and 99',()=>{for(const value of [1,99])assert.equal(isValidQuantity(value),true);for(const value of [0,-1,100,1.5,NaN])assert.equal(isValidQuantity(value),false)});
test('discount percentage requires original price above sale price',()=>{assert.equal(discountPercent(1000,750),25);assert.equal(discountPercent(100,100),0);assert.equal(discountPercent(50,75),0);assert.equal(discountPercent(100,-1),0)});

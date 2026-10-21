import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeIranPhone} from '../lib/phone.mjs';
test('normalizes domestic Iranian mobile numbers to E.164',()=>{
 assert.equal(normalizeIranPhone('09123456789'),'+989123456789');
 assert.equal(normalizeIranPhone('+989123456789'),'+989123456789');
 assert.equal(normalizeIranPhone('989123456789'),'+989123456789');
});
test('accepts Persian and Arabic-Indic numerals',()=>{
 assert.equal(normalizeIranPhone('۰۹۱۲۳۴۵۶۷۸۹'),'+989123456789');
 assert.equal(normalizeIranPhone('٠٩١٢٣٤٥٦٧٨٩'),'+989123456789');
});
test('rejects invalid or incomplete numbers',()=>{
 for(const input of ['', '0912345', '02112345678', '12345678901', '+44123456789', null]) assert.equal(normalizeIranPhone(input),null);
});

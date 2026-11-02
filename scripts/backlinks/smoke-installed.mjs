// Copy this file into a clean consumer directory after installing the tarball.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {data, getThresholds} from 'aftptcalc-army-aft-data';

const require = createRequire(import.meta.url);
assert.equal(getThresholds({event: 'mdl', age: 24, sex: 'male'}).rows.find(row => row.points === 60).threshold, 150);
const json = JSON.parse(readFileSync(require.resolve('aftptcalc-army-aft-data/data.json'), 'utf8'));
assert.equal(json.sha256, data.sha256);
assert.equal(readFileSync(require.resolve('aftptcalc-army-aft-data/thresholds.csv'), 'utf8').trim().split(/\r?\n/).length, 6495);
assert.ok(!Object.hasOwn(data, 'alternates'));
console.log('Installed tarball: helper, JSON export, CSV export, and five-event scope passed.');

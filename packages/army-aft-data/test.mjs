import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {data, getThresholds} from './index.mjs';
import {armyMDL100, armyMDL60} from '../../tests/fixtures/official.mjs';

test('MDL thresholds match all 40 independently transcribed 100/60-point fixtures', () => {
  for (const [points, values] of [[100, armyMDL100], [60, armyMDL60]]) {
    for (const [index, expected] of values.entries()) {
      const series = getThresholds({event: 'mdl', age: data.ages[Math.floor(index / 2)], sex: index % 2 ? 'female' : 'male'});
      assert.equal(series.rows.find(row => row.points === points).threshold, expected);
    }
  }
});

test('CSV round-trips every exported non-null cell with correct age, sex, units, and direction', () => {
  const lines = readFileSync(new URL('thresholds.csv', import.meta.url), 'utf8').trim().split(/\r?\n/).slice(1);
  const expected = Object.values(data.tables).flatMap(rows => rows.flatMap(row => row.slice(1))).filter(value => value !== null).length;
  assert.equal(lines.length, expected);
  const seen = new Set();
  for (const line of lines) {
    const [event, points, ageMin, ageMax, sex, threshold, unit, comparison] = line.split(',');
    const band = data.ages.indexOf(+ageMin);
    const row = data.tables[event].find(row => row[0] === +points);
    assert.equal(row[band * 2 + (sex === 'female' ? 2 : 1)], +threshold);
    assert.equal(ageMax, data.ages[band + 1] ? String(data.ages[band + 1] - 1) : '');
    assert.equal(unit, data.events[event].unit);
    assert.equal(comparison, ['sdc', 'run'].includes(event) ? '<=' : '>=');
    const key = [event, points, ageMin, sex].join('/');
    assert.ok(!seen.has(key), `Duplicate CSV cell: ${key}`);
    seen.add(key);
  }
});

test('Age bands and malformed inputs are explicit', () => {
  assert.equal(getThresholds({event: 'run', age: 21, sex: 'male'}).ageMin, 17);
  assert.equal(getThresholds({event: 'run', age: 22, sex: 'male'}).ageMin, 22);
  assert.equal(getThresholds({event: 'run', age: 65, sex: 'female'}).ageMax, null);
  for (const input of [{event: 'run', age: 16, sex: 'male'}, {event: 'run', age: 22.5, sex: 'male'}, {event: 'run', age: 22, sex: 'other'}, {event: '__proto__', age: 22, sex: 'male'}]) assert.throws(() => getThresholds(input), RangeError);
  assert.ok(Object.isFrozen(data.tables.mdl[0]));
});

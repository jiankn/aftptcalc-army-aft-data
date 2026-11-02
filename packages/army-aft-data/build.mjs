import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const source = JSON.parse(read('src/data/army-aft.json'));
const keys = ['sourceTitle', 'sourceUrl', 'effectiveDate', 'verifiedOn', 'rawFile', 'sha256'];
for (const key of keys) assert.ok(source[key], `Missing source field: ${key}`);
assert.ok(new URL(source.sourceUrl).hostname.endsWith('.mil'), 'An official .mil source is required.');
assert.equal(createHash('sha256').update(read(source.rawFile)).digest('hex'), source.sha256, 'Archived official source changed. Reverify before exporting.');

const events = {
  mdl: {label: '3-Repetition Maximum Deadlift', unit: 'lb', comparison: '>='},
  hrpu: {label: 'Hand-Release Push-Up', unit: 'reps', comparison: '>='},
  sdc: {label: 'Sprint-Drag-Carry', unit: 'seconds', comparison: '<='},
  plk: {label: 'Plank', unit: 'seconds', comparison: '>='},
  run: {label: '2-Mile Run', unit: 'seconds', comparison: '<='}
};
const provenance = Object.fromEntries(keys.map(key => [key, source[key]]));
provenance.datasetSha256 = createHash('sha256').update(read('src/data/army-aft.json')).digest('hex');
provenance.scope = 'Five-event AFT scoring thresholds only. No MOS eligibility, pass/fail policy, medical profiles, promotion points, or alternate-event scoring.';
provenance.verificationScope = 'Source metadata and archived-file hashes are preserved from the site dataset. Export tests establish consistency, not a new independent review of every official table cell.';
const tables = Object.fromEntries(Object.keys(events).map(key => [key, source.tables[key]]));
for (const [event, rows] of Object.entries(tables)) {
  assert.ok(rows.length > 0, `Empty table: ${event}`);
  for (const row of rows) {
    assert.equal(row.length, 1 + source.ages.length * 2, `Unexpected columns: ${event}`);
    assert.ok(Number.isFinite(row[0]));
    for (const value of row.slice(1)) assert.ok(value === null || Number.isFinite(value));
  }
}
const data = {...provenance, ages: source.ages, events, tables};
const csv = ['event,points,age_min,age_max,sex,threshold,unit,comparison'];
let cells = 0;
for (const [event, rows] of Object.entries(tables)) {
  for (const row of rows) source.ages.forEach((age, band) => {
    for (const [offset, sex] of [[1, 'male'], [2, 'female']]) {
      const value = row[band * 2 + offset];
      if (value === null) continue;
      csv.push([event, row[0], age, source.ages[band + 1] ? source.ages[band + 1] - 1 : '', sex, value, events[event].unit, events[event].comparison].join(','));
      cells++;
    }
  });
}
const write = (name, value) => writeFileSync(new URL(name, import.meta.url), value);
write('data.json', JSON.stringify(data, null, 2) + '\n');
write('provenance.json', JSON.stringify(provenance, null, 2) + '\n');
write('thresholds.csv', csv.join('\r\n') + '\r\n');
console.log(`Exported ${Object.keys(tables).length} events and ${cells} non-null threshold cells; source verifiedOn remains ${source.verifiedOn}.`);

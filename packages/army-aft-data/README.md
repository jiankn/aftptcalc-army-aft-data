# Army AFT scoring data

Source-attributed Army Fitness Test scoring thresholds for spreadsheet authors and developers building training tools. Includes JSON, long-form CSV, TypeScript declarations, and an age-band lookup helper. No runtime dependencies.

Source and downloadable archives are provided through the [data repository](https://github.com/jiankn/aftptcalc-army-aft-data). Install from npm with `npm install aftptcalc-army-aft-data`.

## Use

Download the JSON/CSV kit or install the package archive from [GitHub Releases](https://github.com/jiankn/aftptcalc-army-aft-data/releases):

```sh
npm install https://github.com/jiankn/aftptcalc-army-aft-data/releases/download/v0.1.0/aftptcalc-army-aft-data-0.1.0.tgz
```

Then query a published age/sex scoring scale:

```js
import {data, getThresholds} from 'aftptcalc-army-aft-data';

const deadlift = getThresholds({event: 'mdl', age: 24, sex: 'male'});
console.log(deadlift.rows.find(row => row.points === 60));
console.log(data.sourceUrl, data.verifiedOn);
```

For an interactive demonstration of the scoring data, use [AFTPTCalc](https://aftptcalc.com/). The [methodology page](https://aftptcalc.com/methodology/) describes the site's original-document archive, import methods, checks, and limitations.

## Data format

`data.json` preserves `sourceTitle`, `sourceUrl`, `effectiveDate`, `verifiedOn`, and the archived official document's SHA-256. It includes only the five regular AFT events: `mdl`, `hrpu`, `sdc`, `plk`, and `run`.

The original wide tables contain points in column 0, then male/female threshold pairs for each lower age boundary in `ages`. `null` means no threshold is listed in that cell; it must not be converted to zero.

`thresholds.csv` contains one row per non-null cell:

| Field | Meaning |
|---|---|
| event | Event key |
| points | Published point value |
| age_min / age_max | Inclusive band boundaries; a blank age_max represents the final 62+ band |
| sex | Published male or female scoring scale |
| threshold | Raw performance threshold, without time formatting |
| unit | lb, reps, or seconds |
| comparison | >= for deadlift, push-ups, and plank; <= for sprint-drag-carry and run |

Import CSV columns as data in your spreadsheet, not formulas. Scores use the best eligible published threshold, rather than linear interpolation. The helper returns threshold rows; it does not make an eligibility or pass/fail decision.

## Source and limits

Original: [Army Fitness Test Scoring Scales, approved May 15, 2025](https://www.army.mil/e2/downloads/rv7/aft/AFT_Scoring_Scales_250601.pdf), effective June 1, 2025. The underlying site's dataset records verification on October 29, 2026. Packaging does not advance that date or establish a new independent review of every cell.

Only regular five-event scoring thresholds are included. MOS eligibility, combat-scale selection, total-score requirements, medical profiles, alternate events, promotion points, body composition, and administrative decisions require their applicable official sources and are outside this package's scope. Age-band selection alone does not determine whether an individual is eligible for a test or scoring policy.

The provenance `rawFile` is an archive-relative locator in the source repository. The PDF is archived there for reproducible builds and is excluded from the installable npm-format archive. Use the official source URL to retrieve the original. `datasetSha256` identifies the site's full source JSON before this scoped export.

## Rebuild and verify

In the data repository checkout (Node.js 22.12 or later):

```sh
npm --prefix packages/army-aft-data run build
npm --prefix packages/army-aft-data test
```

Build verifies the official archived PDF hash before exporting. Tests compare 40 independently transcribed deadlift cells and round-trip every exported CSV cell. These checks do not certify all of the underlying official tables independently.

## License and independence

MIT applies to this package's original code and documentation. No ownership or new license is asserted over the original government documents or their source material.

Unofficial military fitness resource. AFTPTCalc is independently operated and is not affiliated with, endorsed by, or part of the U.S. Department of Defense, the U.S. Army, or any government agency. Use official instructions for record testing and administrative decisions.

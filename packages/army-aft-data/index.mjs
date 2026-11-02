import raw from './data.json' with {type: 'json'};

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export const data = freeze(raw);

/** Read published thresholds for an age band. Does not determine pass/fail. */
export function getThresholds({event, age, sex}) {
  if (!Object.hasOwn(data.tables, event)) throw new RangeError('Choose mdl, hrpu, sdc, plk, or run.');
  if (!Number.isInteger(age) || age < data.ages[0]) throw new RangeError('Age must be a whole number of at least 17.');
  if (!['male', 'female'].includes(sex)) throw new RangeError('Choose a male or female published scoring scale.');
  const band = data.ages.findLastIndex(minimum => age >= minimum);
  const col = band * 2 + (sex === 'female' ? 2 : 1);
  return {
    event,
    ageMin: data.ages[band],
    ageMax: data.ages[band + 1] ? data.ages[band + 1] - 1 : null,
    sex,
    unit: data.events[event].unit,
    comparison: data.events[event].comparison,
    rows: data.tables[event].filter(row => row[col] !== null).map(row => ({points: row[0], threshold: row[col]}))
  };
}

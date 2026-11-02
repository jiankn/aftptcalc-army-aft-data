export type Event = 'mdl' | 'hrpu' | 'sdc' | 'plk' | 'run';
export type Sex = 'male' | 'female';
export interface ThresholdSeries {
  event: Event;
  ageMin: number;
  ageMax: number | null;
  sex: Sex;
  unit: 'lb' | 'reps' | 'seconds';
  comparison: '>=' | '<=';
  rows: Array<{points: number; threshold: number}>;
}
export const data: {
  readonly sourceTitle: string;
  readonly sourceUrl: string;
  readonly effectiveDate: string;
  readonly verifiedOn: string;
  readonly rawFile: string;
  readonly sha256: string;
  readonly datasetSha256: string;
  readonly scope: string;
  readonly verificationScope: string;
  readonly ages: ReadonlyArray<number>;
  readonly events: Readonly<Record<Event, Readonly<{label: string; unit: ThresholdSeries['unit']; comparison: ThresholdSeries['comparison']}>>>;
  readonly tables: Readonly<Record<Event, ReadonlyArray<ReadonlyArray<number | null>>>>;
};
export function getThresholds(input: {event: Event; age: number; sex: Sex}): ThresholdSeries;

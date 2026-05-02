import {
  minutesToHHMM,
  normalizeToStartOfDayUtc,
} from '../../src/shared/utils/date.utils';

describe('minutesToHHMM', () => {
  it.each([
    [0, '00:00'],
    [60, '01:00'],
    [300, '05:00'],
    [600, '10:00'],
    [1080, '18:00'],
    [1439, '23:59'],
  ])('%i minutes → %s', (input, expected) => {
    expect(minutesToHHMM(input)).toBe(expected);
  });
});

describe('normalizeToStartOfDayUtc', () => {
  it('already at 00:00 UTC returns same day', () => {
    const ts = Date.UTC(2020, 5, 20); // 2020-06-20T00:00:00Z
    expect(normalizeToStartOfDayUtc(ts).toISOString()).toBe(
      '2020-06-20T00:00:00.000Z',
    );
  });

  it('mid-day timestamp normalizes to 00:00 UTC', () => {
    const ts = Date.UTC(2020, 5, 20, 14, 30); // 14:30 UTC
    expect(normalizeToStartOfDayUtc(ts).toISOString()).toBe(
      '2020-06-20T00:00:00.000Z',
    );
  });

  it('23:59 UTC normalizes to same day', () => {
    const ts = Date.UTC(2020, 5, 20, 23, 59, 59);
    expect(normalizeToStartOfDayUtc(ts).toISOString()).toBe(
      '2020-06-20T00:00:00.000Z',
    );
  });
});

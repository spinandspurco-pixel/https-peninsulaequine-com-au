/**
 * Time anchors for the HQ Command Centre, fixed to Australia/Melbourne.
 *
 * Definitions agreed in the C.1c scope:
 *   - "Today"     → since 00:00 Australia/Melbourne local.
 *   - "Overnight" → since the previous day 17:00 Australia/Melbourne local.
 *
 * Returned values are UTC ISO strings, suitable for direct comparison with
 * Supabase `timestamptz` columns via `.gte("created_at", anchor)`.
 */
const TIMEZONE = "Australia/Melbourne";

function getMelbourneParts(date: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
} {
  const fmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    // Intl returns "24" when the local hour is midnight; normalise to 0.
    hour: get("hour") % 24,
  };
}

/**
 * Returns the UTC instant corresponding to the given Melbourne local
 * wall-clock time on the given Melbourne calendar date.
 *
 * Algorithm: build a guessed UTC Date by treating the wall-clock as UTC,
 * then measure how far Melbourne sees that instant and correct. One pass is
 * enough except at the spring-forward DST gap, where we do a second pass.
 */
function melbourneWallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
): Date {
  let utcGuess = Date.UTC(year, month - 1, day, hour, 0, 0, 0);
  for (let i = 0; i < 2; i++) {
    const seen = getMelbourneParts(new Date(utcGuess));
    const seenUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, 0, 0, 0);
    const wantedUtc = Date.UTC(year, month - 1, day, hour, 0, 0, 0);
    const drift = wantedUtc - seenUtc;
    if (drift === 0) break;
    utcGuess += drift;
  }
  return new Date(utcGuess);
}

/** UTC ISO for the most recent Melbourne 00:00 (i.e. start of "today"). */
export function melbourneTodayStart(now: Date = new Date()): string {
  const { year, month, day } = getMelbourneParts(now);
  return melbourneWallClockToUtc(year, month, day, 0).toISOString();
}

/**
 * UTC ISO for the most recent Melbourne 17:00 *prior to now*. If it's past
 * 17:00 Melbourne, that's today at 17:00; otherwise yesterday at 17:00.
 */
export function melbourneOvernightStart(now: Date = new Date()): string {
  const { year, month, day, hour } = getMelbourneParts(now);
  if (hour >= 17) {
    return melbourneWallClockToUtc(year, month, day, 17).toISOString();
  }
  const prev = new Date(Date.UTC(year, month - 1, day) - 24 * 60 * 60 * 1000);
  const prevParts = getMelbourneParts(prev);
  return melbourneWallClockToUtc(
    prevParts.year,
    prevParts.month,
    prevParts.day,
    17,
  ).toISOString();
}

/** Localised "Good morning / afternoon / evening" by Melbourne hour. */
export function melbourneGreeting(now: Date = new Date()): string {
  const { hour } = getMelbourneParts(now);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export type Schedule = Partial<Record<string, [string, string][]>>;
const minutes = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
export function openingState(
  now: Date,
  hours: Schedule | null,
  exceptions: Record<string, [string, string][]> = {},
) {
  if (!hours) return "unknown";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const intervals = exceptions[date] ?? hours[get("weekday")];
  if (!intervals) return "unknown";
  const at = Number(get("hour")) * 60 + Number(get("minute"));
  return intervals.some(([a, b]) => at >= minutes(a) && at < minutes(b))
    ? "open"
    : "closed";
}

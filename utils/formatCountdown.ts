/** Formats a duration in seconds as a zero-padded "HH:MM:SS" countdown string. */
export function formatCountdown(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "00:00:00";

  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

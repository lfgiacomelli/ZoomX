export function getLocalISOString() {
  const now = new Date();
  const tzOffset = -now.getTimezoneOffset(); // offset em minutos, invertido para sinal correto
  const diff = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const hours = pad(tzOffset / 60);
  const minutes = pad(tzOffset % 60);

  const localISO = now.toISOString().slice(0, -1); // remove o Z do UTC
  return `${localISO}${diff}${hours}:${minutes}`;
}

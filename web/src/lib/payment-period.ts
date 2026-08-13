export const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

export function formatPaymentPeriod(month: number, year: number): string {
  const name = MONTHS_FR[month - 1];
  if (!name) return `${month}/${year}`;
  return `${name} ${year}`;
}

export function mensualiteLabel(month: number, year: number): string {
  return `Mensualité ${formatPaymentPeriod(month, year)}`;
}

export function currentPaymentPeriod(date = new Date()) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

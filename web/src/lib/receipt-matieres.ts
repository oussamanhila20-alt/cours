/** Ovals du reçu d’inscription (fiche papier Centre Bêta). */
export const RECEIPT_MATIERE_OVALS = [
  { code: "MATH", test: (s: string) => /math/.test(s) },
  { code: "PC", test: (s: string) => /physique|chimie|(^|[\s/.-])pc($|[\s/.-])/.test(s) },
  { code: "SVT", test: (s: string) => /(^|[\s/.-])svt($|[\s/.-])|sciences de la vie/.test(s) },
  { code: "FR", test: (s: string) => /francais/.test(s) },
  { code: "ANG", test: (s: string) => /anglais|english|(^|[\s/.-])ang($|[\s/.-])/.test(s) },
  { code: "E.I", test: (s: string) => /islam|(^|[\s/.-])e\.?i($|[\s/.-])/.test(s) },
  { code: "H.G", test: (s: string) => /histoire|geograph|(^|[\s/.-])h\.?g($|[\s/.-])/.test(s) },
  { code: "AR", test: (s: string) => /arabe|arabic/.test(s) },
  { code: "P.H", test: (s: string) => /philo|(^|[\s/.-])p\.?h($|[\s/.-])/.test(s) },
  { code: "C.A", test: (s: string) => /compta|informatique|computer|artistique|(^|[\s/.-])c\.?a($|[\s/.-])/.test(s) },
] as const;

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function selectedReceiptMatiereCodes(subjectNames: string[]): Set<string> {
  const selected = new Set<string>();
  const folded = subjectNames.map(fold);
  for (const oval of RECEIPT_MATIERE_OVALS) {
    if (folded.some((s) => oval.test(s))) selected.add(oval.code);
  }
  return selected;
}

/**
 * Group links by their `section` label. Links without one come first in a
 * headless group; the rest keep the order their section first appears in.
 */
export function groupLinks<T extends { section?: string }>(
  links: T[]
): { title: string; links: T[] }[] {
  const groups: { title: string; links: T[] }[] = [];
  const byTitle = new Map<string, T[]>();

  for (const link of links) {
    const title = (link.section ?? "").trim();
    let bucket = byTitle.get(title);
    if (!bucket) {
      bucket = [];
      byTitle.set(title, bucket);
      groups.push({ title, links: bucket });
    }
    bucket.push(link);
  }

  // Array.sort is stable, so non-empty sections keep first-seen order.
  groups.sort((a, b) => (a.title === "" ? -1 : b.title === "" ? 1 : 0));
  return groups;
}

/** Distinct section names currently in use, in first-seen order. */
export function sectionNames<T extends { section?: string }>(links: T[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const link of links) {
    const s = (link.section ?? "").trim();
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

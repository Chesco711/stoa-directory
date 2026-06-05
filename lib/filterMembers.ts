import { Member } from '@/lib/types';

/**
 * Client-side directory filters. All filtering runs over the already-fetched
 * members array — no Supabase queries, no new dependencies.
 *
 * Matching rule: a member tile stays visible only when EVERY active filter is
 * satisfied (AND across the four filter types). An individual filter is
 * satisfied when the member OR at least one of their loaded projects matches
 * it. Within the multi-select tag facet, selecting more tags broadens the
 * result (OR — a member matches if it carries any of the selected tags).
 */
export interface Filters {
  /** Case-insensitive substring against member name AND project titles. */
  search: string;
  /** Selected project.type, or null for "all types". */
  type: string | null;
  /** Selected tags (member tags + project tags), OR-combined within the facet. */
  tags: string[];
  /** Only members with at least one loaded project seeking feedback. */
  needsFeedback: boolean;
}

export const emptyFilters: Filters = {
  search: '',
  type: null,
  tags: [],
  needsFeedback: false,
};

export function isFilterActive(f: Filters): boolean {
  return (
    f.search.trim() !== '' ||
    f.type !== null ||
    f.tags.length > 0 ||
    f.needsFeedback
  );
}

export interface FilterOptions {
  types: string[];
  tags: string[];
}

/** Build dropdown/pill options dynamically from the loaded data — nothing hardcoded. */
export function deriveFilterOptions(members: Member[]): FilterOptions {
  const types = new Set<string>();
  const tags = new Set<string>();

  for (const m of members) {
    for (const t of m.tags) tags.add(t);
    for (const p of m.projects) {
      if (p.type) types.add(p.type);
      for (const t of p.tags) tags.add(t);
    }
  }

  return {
    types: [...types].sort((a, b) => a.localeCompare(b)),
    tags: [...tags].sort((a, b) => a.localeCompare(b)),
  };
}

export function filterMembers(members: Member[], f: Filters): Member[] {
  const q = f.search.trim().toLowerCase();

  return members.filter((m) => {
    const projects = m.projects;

    // 1. Name search — member name OR any project title.
    if (q) {
      const hit =
        m.name.toLowerCase().includes(q) ||
        projects.some((p) => p.title.toLowerCase().includes(q));
      if (!hit) return false;
    }

    // 2. Project type — at least one loaded project of the selected type.
    if (f.type && !projects.some((p) => p.type === f.type)) return false;

    // 3. Tags — member matches if it carries ANY selected tag, on the member
    //    itself or on one of its projects.
    if (
      f.tags.length > 0 &&
      !f.tags.some(
        (tag) =>
          m.tags.includes(tag) || projects.some((p) => p.tags.includes(tag)),
      )
    ) {
      return false;
    }

    // 4. Needs feedback — at least one loaded project seeking feedback.
    if (f.needsFeedback && !projects.some((p) => p.seekingFeedback)) return false;

    return true;
  });
}

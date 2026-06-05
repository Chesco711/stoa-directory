'use client';

import { useMemo } from 'react';
import { Member } from '@/lib/types';
import {
  Filters,
  deriveFilterOptions,
  isFilterActive,
} from '@/lib/filterMembers';

interface Props {
  /** Full loaded list — used to derive the available type/tag options. */
  members: Member[];
  filters: Filters;
  onChange: (next: Filters) => void;
  /** Total loaded members (denominator for the result count). */
  total: number;
  /** Members remaining after filtering (numerator). */
  resultCount: number;
  /** Reset every filter back to its empty state. */
  onClear: () => void;
}

const pillBase =
  'rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer';
const pillOn = 'bg-violet-600 text-white';
const pillOff = 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200';

export default function FilterBar({
  members,
  filters,
  onChange,
  total,
  resultCount,
  onClear,
}: Props) {
  const { types, tags } = useMemo(() => deriveFilterOptions(members), [members]);
  const active = isFilterActive(filters);

  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  }

  return (
    <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      {/* Search + needs-feedback toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            ⌕
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search members or projects…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            onChange({ ...filters, needsFeedback: !filters.needsFeedback })
          }
          aria-pressed={filters.needsFeedback}
          className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            filters.needsFeedback
              ? 'border-violet-600 bg-violet-600 text-white'
              : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
          }`}
        >
          Needs feedback
        </button>
      </div>

      {/* Project-type pills — built from the loaded data */}
      {types.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-zinc-400">Type</span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, type: null })}
            className={`${pillBase} ${filters.type === null ? pillOn : pillOff}`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...filters, type: t })}
              className={`${pillBase} ${filters.type === t ? pillOn : pillOff}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Tag pills — built from member + project tags in the loaded data */}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-zinc-400">Tags</span>
          {tags.map((tag) => {
            const on = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={on}
                className={`${pillBase} ${on ? pillOn : pillOff}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Result count + clear action — only while a filter is active */}
      {active && (
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
          <p className="text-sm text-zinc-500">
            Showing{' '}
            <span className="font-semibold text-zinc-900">{resultCount}</span> of{' '}
            {total} {total === 1 ? 'member' : 'members'}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

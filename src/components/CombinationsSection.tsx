import React, { useState } from 'react';
import { Check, Play } from 'lucide-react';
import {
  BOXING_COMBINATIONS,
  BoxingCombination,
  ComboCategory,
} from '../data/workoutData';

interface CombinationsSectionProps {
  completedSetsById: Record<string, number>;
  onToggleSet: (comboId: string, setNum: number) => void;
  onTrainSingle: (combo: BoxingCombination) => void;
  onTrainAll: () => void;
}

type CategoryFilter = 'All' | ComboCategory;

export const CombinationsSection: React.FC<CombinationsSectionProps> = ({
  completedSetsById,
  onToggleSet,
  onTrainSingle,
  onTrainAll,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('All');

  const filtered =
    filter === 'All'
      ? BOXING_COMBINATIONS
      : BOXING_COMBINATIONS.filter((c) => c.category === filter);

  const totalDoneSets = BOXING_COMBINATIONS.reduce(
    (acc, c) => acc + (completedSetsById[c.id] ?? 0),
    0
  );
  const totalPossibleSets = BOXING_COMBINATIONS.reduce((acc, c) => acc + c.sets, 0);

  return (
    <section
      id="combinations"
      aria-labelledby="combinations-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#EF4444]">
            03. Bag &amp; Shadowboxing
          </p>
          <h2
            id="combinations-heading"
            className="mt-1 font-display text-4xl font-bold italic tracking-tight text-white sm:text-5xl"
          >
            10 Signature Combinations
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            3 sets of 30 seconds each ·{' '}
            <span className="font-mono tabular-nums font-semibold text-white">
              {totalDoneSets} / {totalPossibleSets}
            </span>{' '}
            rounds logged today
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-800 bg-[#121215] p-1"
            role="group"
            aria-label="Filter combinations by style"
          >
            {(['All', 'Head & Power', 'Body Work', 'Defense & Feints'] as CategoryFilter[]).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                    filter === tab
                      ? 'bg-[#DC2626] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'All' ? `All (${BOXING_COMBINATIONS.length})` : tab}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onTrainAll}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>Run All 10 Combos</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((combo) => {
          const completed = completedSetsById[combo.id] ?? 0;
          const allDone = completed >= combo.sets;

          return (
            <article
              key={combo.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-transform duration-150 hover:-translate-y-0.5 ${
                allDone
                  ? 'border-[#DC2626]/70 bg-[#181214]'
                  : 'border-zinc-800 bg-[#121215] hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-zinc-400">
                      <span className="font-semibold text-[#EF4444]">
                        Combo {String(combo.order).padStart(2, '0')}
                      </span>{' '}
                      · {combo.category} · {combo.sets} sets × {combo.durationSec}s
                    </p>
                    <h3 className="mt-1 font-display text-3xl font-bold tracking-tight text-white text-balance">
                      {combo.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTrainSingle(combo)}
                    aria-label={`Run timer for ${combo.title}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#18181C] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#DC2626] hover:bg-[#DC2626] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Train 30s</span>
                  </button>
                </div>

                {/* Unboxed strike/defense flow sequence */}
                <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-y border-zinc-800/80 py-3">
                  {combo.steps.map((step, i) => (
                    <React.Fragment key={`${combo.id}-step-${i}`}>
                      <span className="font-mono text-xs font-semibold text-zinc-100">
                        <span className="mr-1.5 text-[#EF4444]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {step}
                      </span>
                      {i < combo.steps.length - 1 && (
                        <span aria-hidden="true" className="text-zinc-600">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {combo.cue}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-800/80 pt-4">
                <span className="font-mono text-xs tabular-nums text-zinc-400">
                  Rounds logged: <strong className="text-white">{completed}</strong>/{combo.sets}
                </span>

                <div
                  className="flex items-center gap-2"
                  role="group"
                  aria-label={`${combo.title} 3 sets`}
                >
                  {[1, 2, 3].map((setNum) => {
                    const isDone = setNum <= completed;
                    return (
                      <button
                        key={setNum}
                        type="button"
                        onClick={() => onToggleSet(combo.id, setNum)}
                        aria-pressed={isDone}
                        aria-label={`${combo.title} set ${setNum}`}
                        className={`inline-flex min-h-[40px] min-w-[46px] items-center justify-center gap-1 rounded-lg border px-2.5 font-mono text-xs font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                          isDone
                            ? 'border-[#DC2626] bg-[#DC2626] text-white'
                            : 'border-zinc-800 bg-[#18181C] text-zinc-300 hover:border-zinc-600 hover:text-white'
                        }`}
                      >
                        {isDone && (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span>S{setNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

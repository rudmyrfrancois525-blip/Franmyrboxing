import React, { useState } from 'react';
import { Check, Play } from 'lucide-react';
import { CONDITIONING_DRILLS, ConditioningDrill } from '../data/workoutData';

interface ConditioningSectionProps {
  completedSetsById: Record<string, number>;
  onToggleSet: (drillId: string, setNum: number) => void;
  onTrainSingle: (drill: ConditioningDrill) => void;
  onTrainAll: () => void;
}

type FocusFilter = 'All' | ConditioningDrill['focus'];

export const ConditioningSection: React.FC<ConditioningSectionProps> = ({
  completedSetsById,
  onToggleSet,
  onTrainSingle,
  onTrainAll,
}) => {
  const [filter, setFilter] = useState<FocusFilter>('All');

  const filtered =
    filter === 'All'
      ? CONDITIONING_DRILLS
      : CONDITIONING_DRILLS.filter((d) => d.focus === filter);

  const totalDoneSets = CONDITIONING_DRILLS.reduce(
    (acc, d) => acc + (completedSetsById[d.id] ?? 0),
    0
  );
  const totalPossibleSets = CONDITIONING_DRILLS.reduce((acc, d) => acc + d.sets, 0);

  return (
    <section
      id="conditioning"
      aria-labelledby="conditioning-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#EF4444]">
            02. Metabolic Conditioning
          </p>
          <h2
            id="conditioning-heading"
            className="mt-1 font-display text-4xl font-bold italic tracking-tight text-white sm:text-5xl"
          >
            10-Move Conditioning Circuit
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
            aria-label="Filter conditioning drills by focus"
          >
            {(['All', 'Full Body', 'Core & Agility', 'Lower Body Power'] as FocusFilter[]).map(
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
                  {tab === 'All' ? `All (${CONDITIONING_DRILLS.length})` : tab}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onTrainAll}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-zinc-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
          >
            <Play className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
            <span>Run Full Circuit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((drill) => {
          const completed = completedSetsById[drill.id] ?? 0;
          const allDone = completed >= drill.sets;

          return (
            <article
              key={drill.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-transform duration-150 hover:-translate-y-0.5 ${
                allDone
                  ? 'border-[#DC2626]/70 bg-[#181214]'
                  : 'border-zinc-800 bg-[#121215] hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-zinc-400">
                      <span className="text-[#EF4444] font-semibold">
                        {String(drill.order).padStart(2, '0')}
                      </span>{' '}
                      · {drill.focus} · {drill.sets} sets × {drill.durationSec}s
                    </p>
                    <h3 className="mt-1 font-display text-3xl font-bold tracking-tight text-white">
                      {drill.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTrainSingle(drill)}
                    aria-label={`Start 30 second timer for ${drill.name}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#18181C] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-[#DC2626] hover:bg-[#DC2626] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Train 30s</span>
                  </button>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {drill.cue}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-800/80 pt-4">
                <span className="font-mono text-xs tabular-nums text-zinc-400">
                  Sets completed: <strong className="text-white">{completed}</strong>/{drill.sets}
                </span>

                <div
                  className="flex items-center gap-2"
                  role="group"
                  aria-label={`${drill.name} 3 sets`}
                >
                  {[1, 2, 3].map((setNum) => {
                    const isDone = setNum <= completed;
                    return (
                      <button
                        key={setNum}
                        type="button"
                        onClick={() => onToggleSet(drill.id, setNum)}
                        aria-pressed={isDone}
                        aria-label={`${drill.name} set ${setNum}`}
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

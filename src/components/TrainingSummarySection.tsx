import React from 'react';
import { Check, RotateCcw, Trash2 } from 'lucide-react';
import {
  BOXING_COMBINATIONS,
  CONDITIONING_DRILLS,
  JUMP_ROPE_CONFIG,
  LoggedSession,
  SPRINTS_CONFIG,
} from '../data/workoutData';

interface TrainingSummarySectionProps {
  ropeCompletedSets: number;
  sprintCompletedSets: number;
  conditioningSets: Record<string, number>;
  combinationSets: Record<string, number>;
  history: LoggedSession[];
  onSaveSession: () => void;
  onResetToday: () => void;
  onClearHistory: () => void;
}

export const TrainingSummarySection: React.FC<TrainingSummarySectionProps> = ({
  ropeCompletedSets,
  sprintCompletedSets,
  conditioningSets,
  combinationSets,
  history,
  onSaveSession,
  onResetToday,
  onClearHistory,
}) => {
  const condDone = CONDITIONING_DRILLS.reduce(
    (acc, d) => acc + (conditioningSets[d.id] ?? 0),
    0
  );
  const condTotal = CONDITIONING_DRILLS.reduce((acc, d) => acc + d.sets, 0);

  const comboDone = BOXING_COMBINATIONS.reduce(
    (acc, c) => acc + (combinationSets[c.id] ?? 0),
    0
  );
  const comboTotal = BOXING_COMBINATIONS.reduce((acc, c) => acc + c.sets, 0);

  const totalSetsDone =
    ropeCompletedSets + sprintCompletedSets + condDone + comboDone;
  const totalSetsTarget =
    JUMP_ROPE_CONFIG.sets + SPRINTS_CONFIG.sets + condTotal + comboTotal;
  const overallPercent = Math.round((totalSetsDone / totalSetsTarget) * 100);

  return (
    <section
      id="log"
      aria-labelledby="log-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#EF4444]">
            05. Daily Discipline Log
          </p>
          <h2
            id="log-heading"
            className="mt-1 font-display text-4xl font-bold italic tracking-tight text-white sm:text-5xl"
          >
            Session Progress &amp; History
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSaveSession}
            disabled={totalSetsDone === 0}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Save Workout to Log</span>
          </button>

          {totalSetsDone > 0 && (
            <button
              type="button"
              onClick={onResetToday}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#121215] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset Today</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-column Progress Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5">
          <p className="text-xs font-medium text-zinc-400">Jumping Rope</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
            {(ropeCompletedSets * 100).toLocaleString()}
            <span className="text-sm font-normal text-zinc-500"> / 1,500</span>
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-400">
            {ropeCompletedSets} of 15 sets
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5">
          <p className="text-xs font-medium text-zinc-400">Sprints</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
            {sprintCompletedSets}
            <span className="text-sm font-normal text-zinc-500"> / 5</span>
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-400">
            All-out sets
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5">
          <p className="text-xs font-medium text-zinc-400">Conditioning</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
            {condDone}
            <span className="text-sm font-normal text-zinc-500"> / {condTotal}</span>
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-zinc-400">
            30-sec rounds
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5">
          <p className="text-xs font-medium text-zinc-400">Combinations</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
            {comboDone}
            <span className="text-sm font-normal text-zinc-500"> / {comboTotal}</span>
          </p>
          <p className="mt-1 font-mono text-xs tabular-nums text-[#EF4444]">
            Overall camp: {overallPercent}%
          </p>
        </div>
      </div>

      {/* Saved Sessions History */}
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#121215] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <h3 className="font-display text-2xl font-bold tracking-tight text-white">
            Saved Training Sessions
          </h3>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-[#EF4444] whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="py-6 text-sm text-zinc-400">
            No saved sessions yet. Check off sets as you train, then select &ldquo;Save
            Workout to Log&rdquo; to record your session.
          </p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {new Date(entry.completedAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    ·{' '}
                    <span className="font-normal text-zinc-400">
                      {new Date(entry.completedAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums text-zinc-300">
                  <span>{(entry.ropeSets * 100).toLocaleString()} rope reps</span>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <span>{entry.sprintSets} sprints</span>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <span>{entry.conditioningSets} cond sets</span>
                  <span aria-hidden="true" className="text-zinc-600">
                    ·
                  </span>
                  <span>{entry.combinationSets} combo sets</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

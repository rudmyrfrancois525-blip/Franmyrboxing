import React, { useEffect, useState } from 'react';
import { Check, Flame, Play, RotateCcw, Timer } from 'lucide-react';
import { JUMP_ROPE_CONFIG, SPRINTS_CONFIG } from '../data/workoutData';
import { playBellStart } from '../utils/boxingAudio';

interface RopeSprintTrackerProps {
  ropeCompletedSets: number;
  onToggleRopeSet: (setNumber: number) => void;
  onQuickAddRopeSet: () => void;
  onResetRope: () => void;
  sprintCompletedSets: number;
  onToggleSprintSet: (setNumber: number) => void;
  onResetSprints: () => void;
  onLaunchSprintTimer: () => void;
  soundEnabled: boolean;
}

export const RopeSprintTracker: React.FC<RopeSprintTrackerProps> = ({
  ropeCompletedSets,
  onToggleRopeSet,
  onQuickAddRopeSet,
  onResetRope,
  sprintCompletedSets,
  onToggleSprintSet,
  onResetSprints,
  onLaunchSprintTimer,
  soundEnabled,
}) => {
  const [paceSeconds, setPaceSeconds] = useState(0);
  const [paceRunning, setPaceRunning] = useState(false);

  useEffect(() => {
    if (!paceRunning) return;
    const id = window.setInterval(() => {
      setPaceSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [paceRunning]);

  const totalRepsLogged = ropeCompletedSets * JUMP_ROPE_CONFIG.repsPerSet;
  const ropePercent = Math.round((ropeCompletedSets / JUMP_ROPE_CONFIG.sets) * 100);
  const sprintPercent = Math.round((sprintCompletedSets / SPRINTS_CONFIG.sets) * 100);

  const formatPace = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleCompleteNextRopeSet = () => {
    if (soundEnabled && ropeCompletedSets < JUMP_ROPE_CONFIG.sets) {
      playBellStart();
    }
    onQuickAddRopeSet();
  };

  return (
    <section
      id="roadwork"
      aria-labelledby="roadwork-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col gap-2 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#EF4444]">
            01. Warm-Up &amp; Engine
          </p>
          <h2
            id="roadwork-heading"
            className="mt-1 font-display text-4xl font-bold italic tracking-tight text-white sm:text-5xl"
          >
            Jump Rope &amp; Sprints
          </h2>
        </div>
        <p className="font-mono text-xs tabular-nums text-zinc-400 sm:text-sm">
          15 sets × 100 reps rope · 5 all-out sprint sets
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Jumping Rope Card (7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-3xl font-bold tracking-tight text-white">
                  {JUMP_ROPE_CONFIG.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {JUMP_ROPE_CONFIG.sets} sets · {JUMP_ROPE_CONFIG.repsPerSet} reps per set ·{' '}
                  {JUMP_ROPE_CONFIG.totalReps.toLocaleString()} total reps
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl font-bold tabular-nums text-white">
                  {totalRepsLogged.toLocaleString()}
                  <span className="text-base font-normal text-zinc-500">
                    {' '}
                    / {JUMP_ROPE_CONFIG.totalReps.toLocaleString()}
                  </span>
                </div>
                <p className="font-mono text-xs tabular-nums text-zinc-400">
                  {ropeCompletedSets} of {JUMP_ROPE_CONFIG.sets} sets ({ropePercent}%)
                </p>
              </div>
            </div>

            {/* Segmented Athletic Progress Bar */}
            <div className="mt-5 grid grid-cols-15 gap-1" aria-hidden="true">
              {Array.from({ length: JUMP_ROPE_CONFIG.sets }, (_, idx) => {
                const filled = idx + 1 <= ropeCompletedSets;
                return (
                  <div
                    key={idx}
                    className={`h-2 rounded-xs transition-colors duration-200 ${
                      filled ? 'bg-[#DC2626]' : 'bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {JUMP_ROPE_CONFIG.cue}
            </p>

            {/* 15 Set Tap Grid */}
            <div
              className="mt-6 grid grid-cols-5 gap-2.5"
              role="group"
              aria-label="Jumping rope 15 sets of 100 reps"
            >
              {Array.from({ length: JUMP_ROPE_CONFIG.sets }, (_, idx) => {
                const setNum = idx + 1;
                const done = setNum <= ropeCompletedSets;
                return (
                  <button
                    key={setNum}
                    type="button"
                    onClick={() => onToggleRopeSet(setNum)}
                    aria-pressed={done}
                    className={`group flex min-h-[52px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                      done
                        ? 'border-[#DC2626] bg-[#DC2626] text-white'
                        : 'border-zinc-800 bg-[#18181C] text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/80'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold tabular-nums">
                      {String(setNum).padStart(2, '0')}
                    </span>
                    <span
                      className={`mt-0.5 flex items-center gap-1 font-mono text-[11px] tabular-nums ${
                        done ? 'text-white/90' : 'text-zinc-500'
                      }`}
                    >
                      {done ? (
                        <>
                          <Check className="h-3 w-3" aria-hidden="true" />
                          <span>100</span>
                        </>
                      ) : (
                        <span>100</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rope Action Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCompleteNextRopeSet}
                disabled={ropeCompletedSets >= JUMP_ROPE_CONFIG.sets}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
              >
                <Flame className="h-4 w-4" aria-hidden="true" />
                {ropeCompletedSets >= JUMP_ROPE_CONFIG.sets
                  ? 'All 15 Sets Complete'
                  : `Log Set ${ropeCompletedSets + 1} (+100)`}
              </button>

              {ropeCompletedSets > 0 && (
                <button
                  type="button"
                  onClick={onResetRope}
                  aria-label="Reset jump rope sets"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181C] px-3.5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Built-in Rope Stopwatch */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tabular-nums text-zinc-200">
                {formatPace(paceSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setPaceRunning((prev) => !prev)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181C] px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
              >
                <Timer className="h-3.5 w-3.5 text-[#EF4444]" aria-hidden="true" />
                <span>{paceRunning ? 'Pause Watch' : 'Stopwatch'}</span>
              </button>
              {paceSeconds > 0 && !paceRunning && (
                <button
                  type="button"
                  onClick={() => setPaceSeconds(0)}
                  aria-label="Clear rope stopwatch"
                  className="inline-flex min-h-[44px] items-center rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-400 hover:text-white whitespace-nowrap shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sprints Card (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121215] p-6 sm:p-8 lg:col-span-5">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-3xl font-bold tracking-tight text-white">
                  {SPRINTS_CONFIG.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {SPRINTS_CONFIG.sets} sets · Max-effort anaerobic bursts
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl font-bold tabular-nums text-white">
                  {sprintCompletedSets}
                  <span className="text-base font-normal text-zinc-500">
                    {' '}
                    / {SPRINTS_CONFIG.sets}
                  </span>
                </div>
                <p className="font-mono text-xs tabular-nums text-zinc-400">
                  {sprintPercent}% done
                </p>
              </div>
            </div>

            {/* Segmented 5-bar progress */}
            <div className="mt-5 grid grid-cols-5 gap-1.5" aria-hidden="true">
              {Array.from({ length: SPRINTS_CONFIG.sets }, (_, idx) => {
                const filled = idx + 1 <= sprintCompletedSets;
                return (
                  <div
                    key={idx}
                    className={`h-2 rounded-xs transition-colors duration-200 ${
                      filled ? 'bg-[#DC2626]' : 'bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              {SPRINTS_CONFIG.cue}
            </p>

            {/* 5 Sprint Set Rows */}
            <div
              className="mt-6 divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800"
              role="group"
              aria-label="5 sprint sets"
            >
              {Array.from({ length: SPRINTS_CONFIG.sets }, (_, idx) => {
                const setNum = idx + 1;
                const done = setNum <= sprintCompletedSets;
                return (
                  <button
                    key={setNum}
                    type="button"
                    onClick={() => onToggleSprintSet(setNum)}
                    aria-pressed={done}
                    className={`flex min-h-[54px] w-full items-center justify-between px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                      done
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#18181C] text-zinc-200 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold tabular-nums ${
                          done ? 'text-white/80' : 'text-zinc-500'
                        }`}
                      >
                        {String(setNum).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold">
                        Sprint Set {setNum}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        done ? 'text-white' : 'text-zinc-400'
                      }`}
                    >
                      {done ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Done</span>
                        </>
                      ) : (
                        <span>Tap to mark</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-5">
            <button
              type="button"
              onClick={onLaunchSprintTimer}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-zinc-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
            >
              <Play className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
              <span>Run 5-Set Sprint Timer</span>
            </button>

            {sprintCompletedSets > 0 && (
              <button
                type="button"
                onClick={onResetSprints}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181C] px-3.5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

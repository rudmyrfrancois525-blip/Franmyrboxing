import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Check,
} from 'lucide-react';
import {
  TimerQueueItem,
  buildCombinationsQueue,
  buildConditioningQueue,
  buildFullCampQueue,
  buildSprintQueue,
} from '../data/workoutData';
import {
  playBellEnd,
  playBellStart,
  playCountdownTick,
  playWarningClack,
  speakCallout,
  stopCallouts,
} from '../utils/boxingAudio';

interface RoundTimerStudioProps {
  activeQueue: TimerQueueItem[];
  queueLabel: string;
  onSelectPreset: (queue: TimerQueueItem[], label: string) => void;
  onMarkDrillSetComplete: (drillId: string, completedSetCount: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  autoStartSignal: number;
}

type TimerPhaseState = 'ready' | 'work' | 'rest' | 'finished';

export const RoundTimerStudio: React.FC<RoundTimerStudioProps> = ({
  activeQueue,
  queueLabel,
  onSelectPreset,
  onMarkDrillSetComplete,
  soundEnabled,
  onToggleSound,
  autoStartSignal,
}) => {
  const [drillIndex, setDrillIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phaseState, setPhaseState] = useState<TimerPhaseState>('ready');
  const [restSeconds, setRestSeconds] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(activeQueue[0]?.durationSec ?? 30);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceCallouts, setVoiceCallouts] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const currentDrill = activeQueue[drillIndex] ?? activeQueue[0];
  const prevSignalRef = useRef(autoStartSignal);

  // Reset when queue changes
  useEffect(() => {
    setDrillIndex(0);
    setCurrentSet(1);
    setIsRunning(false);
    setPhaseState('ready');
    setSecondsLeft(activeQueue[0]?.durationSec ?? 30);
    setActiveStepIdx(0);
  }, [activeQueue]);

  // Trigger auto-start when user clicks "Train" on a specific card or preset
  useEffect(() => {
    if (autoStartSignal !== prevSignalRef.current) {
      prevSignalRef.current = autoStartSignal;
      if (activeQueue.length > 0) {
        const first = activeQueue[0];
        setDrillIndex(0);
        setCurrentSet(1);
        setPhaseState('work');
        setSecondsLeft(first.durationSec);
        setIsRunning(true);
        setActiveStepIdx(0);
        if (soundEnabled) playBellStart();
        if (voiceCallouts) speakCallout(`${first.title}, set 1`);
      }
    }
  }, [autoStartSignal, activeQueue, soundEnabled, voiceCallouts]);

  // Rhythmic combo-step spotlight when work round is active
  useEffect(() => {
    if (!isRunning || phaseState !== 'work' || !currentDrill?.steps?.length) {
      setActiveStepIdx(0);
      return;
    }
    const stepCount = currentDrill.steps.length;
    const id = window.setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % stepCount);
    }, 650);
    return () => window.clearInterval(id);
  }, [isRunning, phaseState, currentDrill]);

  const advanceToNextStep = useCallback(() => {
    if (!currentDrill) return;

    if (phaseState === 'work') {
      onMarkDrillSetComplete(currentDrill.id, currentSet);

      const isLastSetOfDrill = currentSet >= currentDrill.sets;
      const isLastDrill = drillIndex >= activeQueue.length - 1;

      if (isLastSetOfDrill && isLastDrill) {
        if (soundEnabled) playBellEnd();
        if (voiceCallouts) speakCallout('Session complete. Great work.');
        setIsRunning(false);
        setPhaseState('finished');
        setSecondsLeft(0);
        return;
      }

      if (soundEnabled) playBellEnd();
      if (restSeconds > 0) {
        setPhaseState('rest');
        setSecondsLeft(restSeconds);
      } else {
        if (isLastSetOfDrill) {
          const nextDrill = activeQueue[drillIndex + 1];
          setDrillIndex(drillIndex + 1);
          setCurrentSet(1);
          setPhaseState('work');
          setSecondsLeft(nextDrill.durationSec);
          if (soundEnabled) playBellStart();
          if (voiceCallouts) speakCallout(`${nextDrill.title}, set 1`);
        } else {
          const nextSet = currentSet + 1;
          setCurrentSet(nextSet);
          setPhaseState('work');
          setSecondsLeft(currentDrill.durationSec);
          if (soundEnabled) playBellStart();
          if (voiceCallouts) speakCallout(`${currentDrill.title}, set ${nextSet}`);
        }
      }
    } else if (phaseState === 'rest') {
      const isLastSetOfDrill = currentSet >= currentDrill.sets;
      if (isLastSetOfDrill) {
        const nextIdx = drillIndex + 1;
        if (nextIdx < activeQueue.length) {
          const nextDrill = activeQueue[nextIdx];
          setDrillIndex(nextIdx);
          setCurrentSet(1);
          setPhaseState('work');
          setSecondsLeft(nextDrill.durationSec);
          if (soundEnabled) playBellStart();
          if (voiceCallouts) speakCallout(`${nextDrill.title}, set 1`);
        }
      } else {
        const nextSet = currentSet + 1;
        setCurrentSet(nextSet);
        setPhaseState('work');
        setSecondsLeft(currentDrill.durationSec);
        if (soundEnabled) playBellStart();
        if (voiceCallouts) speakCallout(`Set ${nextSet}, ${currentDrill.title}`);
      }
    }
  }, [
    activeQueue,
    currentDrill,
    currentSet,
    drillIndex,
    onMarkDrillSetComplete,
    phaseState,
    restSeconds,
    soundEnabled,
    voiceCallouts,
  ]);

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        const next = prev - 1;
        if (soundEnabled) {
          if (phaseState === 'work' && next === 10 && (currentDrill?.durationSec ?? 30) >= 20) {
            playWarningClack();
          } else if (next <= 3 && next >= 1) {
            playCountdownTick();
          }
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRunning, phaseState, soundEnabled, currentDrill]);

  useEffect(() => {
    if (isRunning && secondsLeft === 0 && (phaseState === 'work' || phaseState === 'rest')) {
      advanceToNextStep();
    }
  }, [isRunning, secondsLeft, phaseState, advanceToNextStep]);

  const handlePlayPause = () => {
    if (!currentDrill) return;
    if (phaseState === 'ready' || phaseState === 'finished') {
      if (phaseState === 'finished') {
        setDrillIndex(0);
        setCurrentSet(1);
      }
      const targetDrill = phaseState === 'finished' ? activeQueue[0] : currentDrill;
      setPhaseState('work');
      setSecondsLeft(targetDrill.durationSec);
      setIsRunning(true);
      if (soundEnabled) playBellStart();
      if (voiceCallouts) speakCallout(`${targetDrill.title}, set 1`);
      return;
    }

    if (isRunning) {
      setIsRunning(false);
      stopCallouts();
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    stopCallouts();
    setDrillIndex(0);
    setCurrentSet(1);
    setPhaseState('ready');
    setSecondsLeft(activeQueue[0]?.durationSec ?? 30);
    setActiveStepIdx(0);
  };

  const handleSkipNext = () => {
    if (!currentDrill) return;
    stopCallouts();
    if (currentSet < currentDrill.sets) {
      const nextSet = currentSet + 1;
      setCurrentSet(nextSet);
      setPhaseState(isRunning ? 'work' : 'ready');
      setSecondsLeft(currentDrill.durationSec);
      if (isRunning && soundEnabled) playBellStart();
      if (isRunning && voiceCallouts) speakCallout(`Set ${nextSet}`);
    } else if (drillIndex < activeQueue.length - 1) {
      const nextIdx = drillIndex + 1;
      const nextDrill = activeQueue[nextIdx];
      setDrillIndex(nextIdx);
      setCurrentSet(1);
      setPhaseState(isRunning ? 'work' : 'ready');
      setSecondsLeft(nextDrill.durationSec);
      if (isRunning && soundEnabled) playBellStart();
      if (isRunning && voiceCallouts) speakCallout(`${nextDrill.title}, set 1`);
    }
  };

  const handlePrev = () => {
    if (!currentDrill) return;
    stopCallouts();
    if (currentSet > 1) {
      setCurrentSet(currentSet - 1);
      setPhaseState(isRunning ? 'work' : 'ready');
      setSecondsLeft(currentDrill.durationSec);
    } else if (drillIndex > 0) {
      const prevIdx = drillIndex - 1;
      const prevDrill = activeQueue[prevIdx];
      setDrillIndex(prevIdx);
      setCurrentSet(prevDrill.sets);
      setPhaseState(isRunning ? 'work' : 'ready');
      setSecondsLeft(prevDrill.durationSec);
    }
  };

  const totalSetsInQueue = useMemo(
    () => activeQueue.reduce((acc, item) => acc + item.sets, 0),
    [activeQueue]
  );

  const currentOverallSetIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < drillIndex; i++) {
      count += activeQueue[i]?.sets ?? 0;
    }
    return count + currentSet;
  }, [activeQueue, drillIndex, currentSet]);

  const maxSecForCurrentPhase =
    phaseState === 'rest' ? restSeconds : currentDrill?.durationSec ?? 30;
  const progressRatio =
    phaseState === 'finished'
      ? 1
      : maxSecForCurrentPhase > 0
      ? Math.max(0, Math.min(1, (maxSecForCurrentPhase - secondsLeft) / maxSecForCurrentPhase))
      : 0;

  const ringRadius = 92;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progressRatio);

  const nextPreview = useMemo(() => {
    if (!currentDrill) return null;
    if (currentSet < currentDrill.sets) {
      return `${currentDrill.title} · Set ${currentSet + 1} of ${currentDrill.sets}`;
    }
    const next = activeQueue[drillIndex + 1];
    return next ? `${next.title} · Set 1 of ${next.sets}` : 'Final Round';
  }, [activeQueue, currentDrill, currentSet, drillIndex]);

  const stateBadgeText =
    phaseState === 'work'
      ? `WORK · ${currentDrill?.durationSec ?? 30}S`
      : phaseState === 'rest'
      ? `REST · ${restSeconds}S`
      : phaseState === 'finished'
      ? 'SESSION COMPLETE'
      : 'READY TO FIGHT';

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <section
      id="timer"
      aria-labelledby="timer-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-8 flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#EF4444]">
            04. Live Round Console
          </p>
          <h2
            id="timer-heading"
            className="mt-1 font-display text-4xl font-bold italic tracking-tight text-white sm:text-5xl"
          >
            Interactive Boxing Timer
          </h2>
        </div>

        {/* Preset Queue Selector Buttons */}
        <div
          className="flex flex-wrap items-center gap-1 rounded-xl border border-zinc-800 bg-[#121215] p-1"
          role="group"
          aria-label="Workout timer presets"
        >
          {[
            { label: 'Full Camp', getQueue: buildFullCampQueue },
            { label: 'Conditioning (10)', getQueue: buildConditioningQueue },
            { label: 'Combinations (10)', getQueue: buildCombinationsQueue },
            { label: 'Sprints (5)', getQueue: buildSprintQueue },
          ].map((preset) => {
            const active = queueLabel === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSelectPreset(preset.getQueue(), preset.label)}
                className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444] ${
                  active
                    ? 'bg-[#DC2626] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* High-Contrast Cornerman Timer Console */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121215]">
        <div className="h-1.5 w-full bg-zinc-900">
          <div
            className={`h-full transition-transform duration-300 ease-linear origin-left ${
              phaseState === 'rest' ? 'bg-amber-400' : 'bg-[#DC2626]'
            }`}
            style={{ transform: `scaleX(${progressRatio})` }}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
          {/* Left: SVG Ring + Countdown Clock + Controls (5 cols) */}
          <div className="flex flex-col items-center justify-between lg:col-span-5 lg:border-r lg:border-zinc-800 lg:pr-8">
            <div className="flex w-full items-center justify-between gap-4">
              <span
                className={`font-mono text-xs font-bold tracking-wider ${
                  phaseState === 'work'
                    ? 'text-[#EF4444]'
                    : phaseState === 'rest'
                    ? 'text-amber-400'
                    : phaseState === 'finished'
                    ? 'text-emerald-400'
                    : 'text-zinc-400'
                }`}
              >
                {stateBadgeText}
              </span>
              <span className="font-mono text-xs tabular-nums text-zinc-400">
                Round {currentOverallSetIndex} / {totalSetsInQueue}
              </span>
            </div>

            {/* SVG Circular Fight Clock */}
            <div className="relative my-6 flex h-56 w-56 items-center justify-center">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 216 216"
                aria-hidden="true"
              >
                <circle
                  cx="108"
                  cy="108"
                  r={ringRadius}
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="8"
                />
                <circle
                  cx="108"
                  cy="108"
                  r={ringRadius}
                  fill="none"
                  stroke={
                    phaseState === 'rest'
                      ? '#FBBF24'
                      : phaseState === 'finished'
                      ? '#34D399'
                      : '#DC2626'
                  }
                  strokeWidth="8"
                  strokeLinecap="butt"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-[stroke-dashoffset] duration-300 ease-linear"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div
                  aria-live="polite"
                  className="font-mono text-6xl font-bold tracking-tight tabular-nums text-white"
                >
                  {formatSeconds(secondsLeft)}
                </div>
                <p className="mt-1 font-mono text-xs tabular-nums text-zinc-400">
                  Set {currentSet} of {currentDrill?.sets ?? 3}
                </p>
              </div>
            </div>

            {/* Primary Transport Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handlePlayPause}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-[#DC2626] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {phaseState === 'ready'
                        ? 'Ring Bell'
                        : phaseState === 'finished'
                        ? 'Restart'
                        : 'Resume'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrev}
                disabled={drillIndex === 0 && currentSet === 1}
                aria-label="Previous set"
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border border-zinc-800 bg-[#18181C] text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleSkipNext}
                disabled={
                  drillIndex >= activeQueue.length - 1 &&
                  currentSet >= (currentDrill?.sets ?? 1)
                }
                aria-label="Next set"
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border border-zinc-800 bg-[#18181C] text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset timer"
                className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg border border-zinc-800 bg-[#18181C] text-zinc-200 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right: Active Drill / Combination Breakdown & Settings (7 cols) */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <span className="font-mono">
                  {queueLabel} · {currentDrill?.phase} · Drill {drillIndex + 1} of{' '}
                  {activeQueue.length}
                </span>
                {currentDrill && (
                  <button
                    type="button"
                    onClick={() => onMarkDrillSetComplete(currentDrill.id, currentSet)}
                    className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline whitespace-nowrap shrink-0"
                  >
                    <Check className="h-3.5 w-3.5 text-[#EF4444]" aria-hidden="true" />
                    <span>Mark set {currentSet} done</span>
                  </button>
                )}
              </div>

              <h3 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl text-balance">
                {currentDrill?.title}
              </h3>

              {/* Step-by-step combination sequence with live tempo highlight */}
              {currentDrill?.steps && currentDrill.steps.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-zinc-800 py-4">
                  {currentDrill.steps.map((step, i) => {
                    const isHighlighted =
                      isRunning && phaseState === 'work' && activeStepIdx === i;
                    return (
                      <React.Fragment key={`${step}-${i}`}>
                        <span
                          className={`font-mono text-sm font-bold transition-colors duration-150 ${
                            isHighlighted
                              ? 'text-[#EF4444] underline decoration-2 underline-offset-8'
                              : 'text-zinc-100'
                          }`}
                        >
                          <span className="mr-1.5 text-xs text-[#EF4444]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {step}
                        </span>
                        {i < currentDrill.steps!.length - 1 && (
                          <span aria-hidden="true" className="text-zinc-600">
                            →
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300">
                {currentDrill?.cue}
              </p>
            </div>

            {/* Bottom Configuration Strip */}
            <div className="flex flex-col gap-4 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-zinc-400">
                  Rest:
                </span>
                {[0, 10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRestSeconds(sec)}
                    className={`min-h-[38px] rounded-md px-2.5 py-1 font-mono text-xs tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                      restSeconds === sec
                        ? 'bg-white text-zinc-950 font-bold'
                        : 'bg-[#18181C] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sec === 0 ? 'None' : `${sec}s`}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleSound}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181C] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 whitespace-nowrap shrink-0"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5 text-[#EF4444]" aria-hidden="true" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  )}
                  <span>{soundEnabled ? 'Bell On' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVoiceCallouts((prev) => !prev)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181C] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 whitespace-nowrap shrink-0"
                >
                  {voiceCallouts ? (
                    <Mic className="h-3.5 w-3.5 text-[#EF4444]" aria-hidden="true" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  )}
                  <span>{voiceCallouts ? 'Callouts On' : 'Callouts Off'}</span>
                </button>
              </div>
            </div>

            {nextPreview && (
              <div className="font-mono text-xs text-zinc-400">
                <span className="text-zinc-500">Up next: </span>
                <span className="text-zinc-200">{nextPreview}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

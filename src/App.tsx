import { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, Play } from 'lucide-react';
import {
  ATHLETE_PROFILE,
  BOXING_COMBINATIONS,
  BoxingCombination,
  CONDITIONING_DRILLS,
  ConditioningDrill,
  JUMP_ROPE_CONFIG,
  LoggedSession,
  SPRINTS_CONFIG,
  TimerQueueItem,
  buildCombinationsQueue,
  buildConditioningQueue,
  buildFullCampQueue,
  buildSprintQueue,
} from './data/workoutData';
import { RopeSprintTracker } from './components/RopeSprintTracker';
import { ConditioningSection } from './components/ConditioningSection';
import { CombinationsSection } from './components/CombinationsSection';
import { RoundTimerStudio } from './components/RoundTimerStudio';
import { TrainingSummarySection } from './components/TrainingSummarySection';

const STORAGE_PROGRESS_KEY = 'franmyr_boxing_daily_progress_v1';
const STORAGE_HISTORY_KEY = 'franmyr_boxing_history_v1';

interface DailyProgressState {
  ropeSets: number;
  sprintSets: number;
  conditioningSets: Record<string, number>;
  combinationSets: Record<string, number>;
}

const DEFAULT_PROGRESS: DailyProgressState = {
  ropeSets: 0,
  sprintSets: 0,
  conditioningSets: {},
  combinationSets: {},
};

export function App() {
  const [progress, setProgress] = useState<DailyProgressState>(() => {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    try {
      const saved = window.localStorage.getItem(STORAGE_PROGRESS_KEY);
      return saved ? { ...DEFAULT_PROGRESS, ...JSON.parse(saved) } : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const [history, setHistory] = useState<LoggedSession[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timerQueue, setTimerQueue] = useState<TimerQueueItem[]>(() =>
    buildFullCampQueue()
  );
  const [queueLabel, setQueueLabel] = useState<string>('Full Camp');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoStartSignal, setAutoStartSignal] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  const scrollToTimer = useCallback(() => {
    const el = document.getElementById('timer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const launchTimerWithQueue = useCallback(
    (queue: TimerQueueItem[], label: string) => {
      setTimerQueue(queue);
      setQueueLabel(label);
      setAutoStartSignal((n) => n + 1);
      scrollToTimer();
    },
    [scrollToTimer]
  );

  const handleToggleRopeSet = (setNum: number) => {
    setProgress((prev) => ({
      ...prev,
      ropeSets: prev.ropeSets === setNum ? setNum - 1 : setNum,
    }));
  };

  const handleQuickAddRopeSet = () => {
    setProgress((prev) => ({
      ...prev,
      ropeSets: Math.min(JUMP_ROPE_CONFIG.sets, prev.ropeSets + 1),
    }));
  };

  const handleResetRope = () => {
    setProgress((prev) => ({ ...prev, ropeSets: 0 }));
  };

  const handleToggleSprintSet = (setNum: number) => {
    setProgress((prev) => ({
      ...prev,
      sprintSets: prev.sprintSets === setNum ? setNum - 1 : setNum,
    }));
  };

  const handleResetSprints = () => {
    setProgress((prev) => ({ ...prev, sprintSets: 0 }));
  };

  const handleToggleConditioningSet = (drillId: string, setNum: number) => {
    setProgress((prev) => {
      const current = prev.conditioningSets[drillId] ?? 0;
      const next = current === setNum ? setNum - 1 : setNum;
      return {
        ...prev,
        conditioningSets: { ...prev.conditioningSets, [drillId]: next },
      };
    });
  };

  const handleToggleCombinationSet = (comboId: string, setNum: number) => {
    setProgress((prev) => {
      const current = prev.combinationSets[comboId] ?? 0;
      const next = current === setNum ? setNum - 1 : setNum;
      return {
        ...prev,
        combinationSets: { ...prev.combinationSets, [comboId]: next },
      };
    });
  };

  const handleMarkDrillSetComplete = useCallback(
    (drillId: string, completedSetCount: number) => {
      setProgress((prev) => {
        if (drillId === 'sprint-session') {
          return {
            ...prev,
            sprintSets: Math.max(prev.sprintSets, Math.min(SPRINTS_CONFIG.sets, completedSetCount)),
          };
        }
        if (drillId.startsWith('cond-')) {
          const existing = prev.conditioningSets[drillId] ?? 0;
          return {
            ...prev,
            conditioningSets: {
              ...prev.conditioningSets,
              [drillId]: Math.max(existing, completedSetCount),
            },
          };
        }
        if (drillId.startsWith('combo-')) {
          const existing = prev.combinationSets[drillId] ?? 0;
          return {
            ...prev,
            combinationSets: {
              ...prev.combinationSets,
              [drillId]: Math.max(existing, completedSetCount),
            },
          };
        }
        return prev;
      });
    },
    []
  );

  const handleTrainConditioningSingle = (drill: ConditioningDrill) => {
    launchTimerWithQueue(
      [
        {
          id: drill.id,
          phase: 'Conditioning',
          title: drill.name,
          cue: drill.cue,
          sets: drill.sets,
          durationSec: drill.durationSec,
        },
      ],
      drill.name
    );
  };

  const handleTrainComboSingle = (combo: BoxingCombination) => {
    launchTimerWithQueue(
      [
        {
          id: combo.id,
          phase: 'Combinations',
          title: combo.title,
          steps: combo.steps,
          cue: combo.cue,
          sets: combo.sets,
          durationSec: combo.durationSec,
        },
      ],
      `Combo ${combo.order}`
    );
  };

  const handleSaveSession = () => {
    const condCount = CONDITIONING_DRILLS.reduce(
      (acc, d) => acc + (progress.conditioningSets[d.id] ?? 0),
      0
    );
    const comboCount = BOXING_COMBINATIONS.reduce(
      (acc, c) => acc + (progress.combinationSets[c.id] ?? 0),
      0
    );
    const totalMinutes = Math.max(
      1,
      Math.round(
        progress.ropeSets * 0.75 +
          progress.sprintSets * 1 +
          (condCount + comboCount) * 0.75
      )
    );

    const newEntry: LoggedSession = {
      id: `${Date.now()}`,
      completedAt: new Date().toISOString(),
      ropeSets: progress.ropeSets,
      sprintSets: progress.sprintSets,
      conditioningSets: condCount,
      combinationSets: comboCount,
      totalMinutes,
    };

    setHistory((prev) => [newEntry, ...prev]);
    setProgress(DEFAULT_PROGRESS);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/90 bg-[#09090B]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Title */}
          <a
            href="#bio"
            className="font-display text-2xl font-bold italic tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
          >
            {ATHLETE_PROFILE.brand}
          </a>

          {/* Zone 2: 5 single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400"
          >
            <a
              href="#bio"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Bio
            </a>
            <a
              href="#roadwork"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Roadwork
            </a>
            <a
              href="#conditioning"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Conditioning
            </a>
            <a
              href="#combinations"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Combinations
            </a>
            <a
              href="#timer"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Timer
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => launchTimerWithQueue(buildFullCampQueue(), 'Full Camp')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#B91C1C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Start Workout</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Split + Fighter Bio */}
        <section
          id="bio"
          aria-labelledby="hero-heading"
          className="mx-auto max-w-6xl px-4 pt-10 pb-14 sm:px-6 lg:px-8 lg:pt-14"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* Left Column: Fighter Story & Primary CTA */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121215] p-7 sm:p-10 lg:col-span-6">
              <div>
                <p className="font-mono text-xs font-semibold tracking-wider text-[#EF4444]">
                  Rudmyr François · Boxer &amp; Athlete
                </p>

                <h1
                  id="hero-heading"
                  className="mt-3 font-display text-5xl font-bold italic tracking-tight text-white sm:text-7xl text-balance leading-[0.94]"
                >
                  {ATHLETE_PROFILE.headline}
                </h1>

                <p className="mt-4 text-base font-medium text-zinc-200">
                  {ATHLETE_PROFILE.subheadline}
                </p>

                <div className="mt-6 space-y-4 border-t border-zinc-800 pt-6 text-[15px] leading-relaxed text-zinc-300">
                  {ATHLETE_PROFILE.bioParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-6">
                <button
                  type="button"
                  onClick={() => launchTimerWithQueue(buildFullCampQueue(), 'Full Camp')}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-[#DC2626] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  <span>Start Full Training Session</span>
                </button>

                <a
                  href="#combinations"
                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#18181C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4444]"
                >
                  <span>Explore 10 Combinations</span>
                  <ArrowDownRight className="h-4 w-4 text-[#EF4444]" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Right Column: High-Contrast Fight Poster Studio Cutout */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-white lg:col-span-6">
              <div className="relative flex flex-1 items-end justify-center bg-white px-6 pt-8">
                {!imageError ? (
                  <img
                    src={ATHLETE_PROFILE.imagePath}
                    alt="Rudmyr François in boxing guard stance"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="h-full max-h-[520px] w-auto object-contain object-bottom contrast-110"
                  />
                ) : (
                  <div className="flex h-80 w-full flex-col items-center justify-center rounded-xl bg-zinc-100 p-6 text-center">
                    <p className="font-display text-2xl font-bold text-zinc-900">
                      {ATHLETE_PROFILE.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Franmyr Boxing · Fighter Profile
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 bg-[#121215] px-6 py-4">
                <div>
                  <p className="font-display text-xl font-bold tracking-tight text-white">
                    {ATHLETE_PROFILE.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Box · Lift · Condition
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-[#EF4444]">
                  1,500 Rope · 60 Rounds
                </span>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Athlete Metrics Strip */}
          <div
            aria-label="Fighter physical metrics"
            className="mt-6 grid grid-cols-2 divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-[#121215] sm:grid-cols-4 sm:divide-x sm:divide-y-0"
          >
            {ATHLETE_PROFILE.stats.map((stat) => (
              <div key={stat.id} className="p-6">
                <p className="text-xs font-medium text-zinc-400">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="font-mono text-3xl font-bold tracking-tight tabular-nums text-white">
                    {stat.value}
                  </span>
                  {stat.secondary && (
                    <span className="font-mono text-sm tabular-nums text-zinc-400">
                      ({stat.secondary})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Athletic Marquee Divider Ribbon */}
        <div
          aria-hidden="true"
          className="overflow-hidden border-y border-zinc-800 bg-[#121215] py-3"
        >
          <div className="animate-athletic-ticker flex w-max items-center gap-8 whitespace-nowrap font-mono text-xs font-semibold tracking-wider text-zinc-400">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className="text-white">Franmyr Boxing</span>
                <span className="text-[#EF4444]">·</span>
                <span>15×100 Jump Rope</span>
                <span className="text-[#EF4444]">·</span>
                <span>5 Sprint Sets</span>
                <span className="text-[#EF4444]">·</span>
                <span>10 Conditioning Drills (3×30s)</span>
                <span className="text-[#EF4444]">·</span>
                <span>10 Boxing Combinations (3×30s)</span>
                <span className="text-[#EF4444]">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Phase 1: Jump Rope (15 x 100) & Sprints (5 sets) */}
        <RopeSprintTracker
          ropeCompletedSets={progress.ropeSets}
          onToggleRopeSet={handleToggleRopeSet}
          onQuickAddRopeSet={handleQuickAddRopeSet}
          onResetRope={handleResetRope}
          sprintCompletedSets={progress.sprintSets}
          onToggleSprintSet={handleToggleSprintSet}
          onResetSprints={handleResetSprints}
          onLaunchSprintTimer={() =>
            launchTimerWithQueue(buildSprintQueue(), 'Sprints (5)')
          }
          soundEnabled={soundEnabled}
        />

        {/* Phase 2: 10 Conditioning Drills (3 sets x 30s each) */}
        <ConditioningSection
          completedSetsById={progress.conditioningSets}
          onToggleSet={handleToggleConditioningSet}
          onTrainSingle={handleTrainConditioningSingle}
          onTrainAll={() =>
            launchTimerWithQueue(buildConditioningQueue(), 'Conditioning (10)')
          }
        />

        {/* Phase 3: 10 Boxing Combinations (3 sets x 30s each) */}
        <CombinationsSection
          completedSetsById={progress.combinationSets}
          onToggleSet={handleToggleCombinationSet}
          onTrainSingle={handleTrainComboSingle}
          onTrainAll={() =>
            launchTimerWithQueue(buildCombinationsQueue(), 'Combinations (10)')
          }
        />

        {/* Phase 4: Interactive Live Round Timer Console */}
        <RoundTimerStudio
          activeQueue={timerQueue}
          queueLabel={queueLabel}
          onSelectPreset={(queue, label) => {
            setTimerQueue(queue);
            setQueueLabel(label);
          }}
          onMarkDrillSetComplete={handleMarkDrillSetComplete}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          autoStartSignal={autoStartSignal}
        />

        {/* Phase 5: Session Progress & Local History */}
        <TrainingSummarySection
          ropeCompletedSets={progress.ropeSets}
          sprintCompletedSets={progress.sprintSets}
          conditioningSets={progress.conditioningSets}
          combinationSets={progress.combinationSets}
          history={history}
          onSaveSession={handleSaveSession}
          onResetToday={() => setProgress(DEFAULT_PROGRESS)}
          onClearHistory={() => setHistory([])}
        />
      </main>

      <footer className="border-t border-zinc-800 bg-[#09090B]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="font-medium text-zinc-200">
            Franmyr Boxing · Rudmyr François
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#bio" className="hover:text-white">
              Bio &amp; Stats
            </a>
            <a href="#roadwork" className="hover:text-white">
              Jump Rope &amp; Sprints
            </a>
            <a href="#conditioning" className="hover:text-white">
              Conditioning
            </a>
            <a href="#combinations" className="hover:text-white">
              Combinations
            </a>
            <a href="#timer" className="hover:text-white">
              Round Timer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

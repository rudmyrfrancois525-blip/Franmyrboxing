export interface AthleteStat {
  id: string;
  label: string;
  value: string;
  secondary?: string;
}

export interface ConditioningDrill {
  id: string;
  order: number;
  name: string;
  sets: number;
  durationSec: number;
  focus: 'Full Body' | 'Core & Agility' | 'Lower Body Power';
  cue: string;
}

export type ComboCategory = 'Head & Power' | 'Body Work' | 'Defense & Feints';

export interface BoxingCombination {
  id: string;
  order: number;
  title: string;
  steps: string[];
  sets: number;
  durationSec: number;
  category: ComboCategory;
  cue: string;
}

export interface TimerQueueItem {
  id: string;
  phase: 'Sprints' | 'Conditioning' | 'Combinations';
  title: string;
  steps?: string[];
  cue: string;
  sets: number;
  durationSec: number;
}

export interface LoggedSession {
  id: string;
  completedAt: string;
  ropeSets: number;
  sprintSets: number;
  conditioningSets: number;
  combinationSets: number;
  totalMinutes: number;
}

export const ATHLETE_PROFILE = {
  brand: 'Franmyr Boxing',
  name: 'Rudmyr François',
  imagePath: '/assets/aistudio/wmremove-transformed_1__8f071090.png',
  headline: 'Train Like a Fighter.',
  subheadline: 'Discipline built in rounds, sprints, and sharp combinations.',
  bioParagraphs: [
    'I’m Rudmyr François, a fitness enthusiast with two years of consistent training.',
    'Training has given me a level of discipline that now carries into every part of my life, and people treat me with greater respect as a result.',
    'I box, lift and condition to keep a lean, athletic physique, and this site shows how I train like a fighter.',
  ],
  stats: [
    { id: 'height', label: 'Height', value: '1.75 m', secondary: '69 in' },
    { id: 'weight', label: 'Weight', value: '80 kg' },
    { id: 'body-fat', label: 'Body fat', value: '10%' },
    { id: 'experience', label: 'Consistent training', value: '2 yrs' },
  ] as AthleteStat[],
};

export const JUMP_ROPE_CONFIG = {
  title: 'Jumping Rope',
  sets: 15,
  repsPerSet: 100,
  totalReps: 1500,
  cue: 'Stay on the balls of your feet, keep elbows tucked near the ribs, and turn the rope cleanly from the wrists.',
};

export const SPRINTS_CONFIG = {
  title: 'Sprints',
  sets: 5,
  workSec: 20,
  cue: 'Drive knees high with aggressive arm swing. Maximum acceleration per rep, full nasal recovery between sets.',
};

export const CONDITIONING_DRILLS: ConditioningDrill[] = [
  {
    id: 'cond-burpees',
    order: 1,
    name: 'Burpees',
    sets: 3,
    durationSec: 30,
    focus: 'Full Body',
    cue: 'Chest to deck, snap feet under hips, finish with an explosive vertical reach.',
  },
  {
    id: 'cond-mountain-climbers',
    order: 2,
    name: 'Mountain climbers',
    sets: 3,
    durationSec: 30,
    focus: 'Core & Agility',
    cue: 'Lock shoulders over wrists and drive knees straight toward the chest at sprint tempo.',
  },
  {
    id: 'cond-jump-squats',
    order: 3,
    name: 'Jump squats',
    sets: 3,
    durationSec: 30,
    focus: 'Lower Body Power',
    cue: 'Sit deep with chest tall, drive through the floor, and land softly into the next rep.',
  },
  {
    id: 'cond-high-knees',
    order: 4,
    name: 'High knees',
    sets: 3,
    durationSec: 30,
    focus: 'Core & Agility',
    cue: 'Pull knees above hip height while pumping hands in a tight boxing guard rhythm.',
  },
  {
    id: 'cond-jumping-jacks',
    order: 5,
    name: 'Jumping jacks',
    sets: 3,
    durationSec: 30,
    focus: 'Full Body',
    cue: 'Keep cadence crisp and shoulders relaxed to regulate breathing under fatigue.',
  },
  {
    id: 'cond-skater-jumps',
    order: 6,
    name: 'Skater jumps',
    sets: 3,
    durationSec: 30,
    focus: 'Lower Body Power',
    cue: 'Bound laterally off one leg, stick the landing for control, and build lateral ring agility.',
  },
  {
    id: 'cond-squat-thrusts',
    order: 7,
    name: 'Squat thrusts',
    sets: 3,
    durationSec: 30,
    focus: 'Full Body',
    cue: 'Shoot feet cleanly to a tight plank without letting hips sag, then snap back to stance.',
  },
  {
    id: 'cond-plank-jacks',
    order: 8,
    name: 'Plank jacks',
    sets: 3,
    durationSec: 30,
    focus: 'Core & Agility',
    cue: 'Brace abs tight and keep hips level while snapping feet out and in.',
  },
  {
    id: 'cond-tuck-jumps',
    order: 9,
    name: 'Tuck jumps',
    sets: 3,
    durationSec: 30,
    focus: 'Lower Body Power',
    cue: 'Explode upward and pull knees toward the chest; reset quickly on the balls of the feet.',
  },
  {
    id: 'cond-jumping-lunges',
    order: 10,
    name: 'Jumping lunges',
    sets: 3,
    durationSec: 30,
    focus: 'Lower Body Power',
    cue: 'Switch stance mid-air with upright torso, keeping rear knee controlled above the floor.',
  },
];

export const BOXING_COMBINATIONS: BoxingCombination[] = [
  {
    id: 'combo-1',
    order: 1,
    title: 'Jab – Cross – Uppercut',
    steps: ['Jab', 'Cross', 'Uppercut'],
    sets: 3,
    durationSec: 30,
    category: 'Head & Power',
    cue: 'Snap the jab to close range, turn the hip on the cross, and drop slightly to dig the uppercut underneath.',
  },
  {
    id: 'combo-2',
    order: 2,
    title: 'Right Uppercut – Left Hook – Cross',
    steps: ['Right Uppercut', 'Left Hook', 'Cross'],
    sets: 3,
    durationSec: 30,
    category: 'Head & Power',
    cue: 'Lift the chin with the rear uppercut, pivot sharply into the lead hook, and finish straight down the pipe.',
  },
  {
    id: 'combo-3',
    order: 3,
    title: 'Side Body Shots',
    steps: ['Side Body Shots'],
    sets: 3,
    durationSec: 30,
    category: 'Body Work',
    cue: 'Step off the center line, bend at the knees, and rip hooks into the ribcage while keeping the opposite hand glued to your cheek.',
  },
  {
    id: 'combo-4',
    order: 4,
    title: 'Right Overhand – Left Uppercut – Right Overhand',
    steps: ['Right Overhand', 'Left Uppercut', 'Right Overhand'],
    sets: 3,
    durationSec: 30,
    category: 'Head & Power',
    cue: 'Loop the first overhand over the guard, dip onto the lead hip for the uppercut, and reload immediately.',
  },
  {
    id: 'combo-5',
    order: 5,
    title: 'Jab – Cross – Left Hook – Right Uppercut',
    steps: ['Jab', 'Cross', 'Left Hook', 'Right Uppercut'],
    sets: 3,
    durationSec: 30,
    category: 'Head & Power',
    cue: 'Four-punch flow: keep the rhythm smooth and rotate shoulders completely on every transfer of weight.',
  },
  {
    id: 'combo-6',
    order: 6,
    title: 'Right Hand',
    steps: ['Right Hand'],
    sets: 3,
    durationSec: 30,
    category: 'Head & Power',
    cue: 'Commit fully to the rear straight: pivot the back foot, rotate the shoulder to protect the chin, and snap back to guard.',
  },
  {
    id: 'combo-7',
    order: 7,
    title: 'Left Block – Left Body Shot – Right Body Shot – Right Lead Hook',
    steps: ['Left Block', 'Left Body Shot', 'Right Body Shot', 'Right Lead Hook'],
    sets: 3,
    durationSec: 30,
    category: 'Body Work',
    cue: 'Absorb cleanly on the left forearm, counter immediately downstairs with both hands, and come up top with the hook.',
  },
  {
    id: 'combo-8',
    order: 8,
    title: 'Jab – Cross – Block – Right Uppercut – Left Hook',
    steps: ['Jab', 'Cross', 'Block', 'Right Uppercut', 'Left Hook'],
    sets: 3,
    durationSec: 30,
    category: 'Defense & Feints',
    cue: 'Stick the 1-2, tighten your shell to catch the return shot, and counter through the middle with the uppercut-hook.',
  },
  {
    id: 'combo-9',
    order: 9,
    title: 'Lazy Jab – Slip – Right Uppercut – Left Hook – Cross',
    steps: ['Lazy Jab', 'Slip', 'Right Uppercut', 'Left Hook', 'Cross'],
    sets: 3,
    durationSec: 30,
    category: 'Defense & Feints',
    cue: 'Bait the counter with a loose jab, slip offline to load the back leg, then unleash three sharp power shots.',
  },
  {
    id: 'combo-10',
    order: 10,
    title: 'Fake Jab – Jab – Right Hand',
    steps: ['Fake Jab', 'Jab', 'Right Hand'],
    sets: 3,
    durationSec: 30,
    category: 'Defense & Feints',
    cue: 'Sell the shoulder and lead-hand feint to freeze the guard, step in with the real jab, and fire the right hand behind it.',
  },
];

export function buildSprintQueue(): TimerQueueItem[] {
  return [
    {
      id: 'sprint-session',
      phase: 'Sprints',
      title: SPRINTS_CONFIG.title,
      cue: SPRINTS_CONFIG.cue,
      sets: SPRINTS_CONFIG.sets,
      durationSec: SPRINTS_CONFIG.workSec,
    },
  ];
}

export function buildConditioningQueue(): TimerQueueItem[] {
  return CONDITIONING_DRILLS.map((d) => ({
    id: d.id,
    phase: 'Conditioning',
    title: d.name,
    cue: d.cue,
    sets: d.sets,
    durationSec: d.durationSec,
  }));
}

export function buildCombinationsQueue(): TimerQueueItem[] {
  return BOXING_COMBINATIONS.map((c) => ({
    id: c.id,
    phase: 'Combinations',
    title: c.title,
    steps: c.steps,
    cue: c.cue,
    sets: c.sets,
    durationSec: c.durationSec,
  }));
}

export function buildFullCampQueue(): TimerQueueItem[] {
  return [
    ...buildSprintQueue(),
    ...buildConditioningQueue(),
    ...buildCombinationsQueue(),
  ];
}

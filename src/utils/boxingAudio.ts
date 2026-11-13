let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function strikeBell(ctx: AudioContext, startTime: number, duration = 0.85, gainPeak = 0.25) {
  const partials = [
    { freq: 880, amp: 1.0 },
    { freq: 1765, amp: 0.45 },
    { freq: 2642, amp: 0.28 },
    { freq: 3520, amp: 0.14 },
  ];

  partials.forEach(({ freq, amp }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainPeak * amp, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  });
}

export function playBellStart() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  strikeBell(ctx, now, 1.0, 0.28);
}

export function playBellEnd() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  strikeBell(ctx, now, 0.5, 0.26);
  strikeBell(ctx, now + 0.18, 0.5, 0.26);
  strikeBell(ctx, now + 0.36, 0.9, 0.28);
}

export function playWarningClack() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [0, 0.12, 0.24].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1150, now + offset);
    osc.frequency.exponentialRampToValueAtTime(420, now + offset + 0.045);

    gain.gain.setValueAtTime(0.001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.07);
  });
}

export function playCountdownTick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}

export function speakCallout(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Gracefully ignore speech synthesis errors on restricted browsers
  }
}

export function stopCallouts() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}

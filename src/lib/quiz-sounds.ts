let audio: AudioContext | null = null;

function context() {
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audio) audio = new Ctx();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, volume: number, type: OscillatorType = "triangle") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playCheer() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    tone(ctx, frequency, now + index * 0.09, 0.28, 0.16);
  });
  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = noise;
  filter.type = "highpass";
  filter.frequency.value = 1200;
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + 0.25);
}

export function playFart() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const length = Math.floor(ctx.sampleRate * 0.7);
  const noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i++) {
    brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    const flutter = Math.sin((i / ctx.sampleRate) * Math.PI * 18) > 0 ? 1 : 0.35;
    data[i] = brown * 3.2 * flutter;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = noise;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(220, now);
  filter.frequency.exponentialRampToValueAtTime(45, now + 0.65);
  filter.Q.value = 0.7;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.9, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + 0.7);

  const blat = ctx.createOscillator();
  const blatGain = ctx.createGain();
  blat.type = "sawtooth";
  blat.frequency.setValueAtTime(140, now);
  blat.frequency.exponentialRampToValueAtTime(42, now + 0.55);
  blatGain.gain.setValueAtTime(0.12, now);
  blatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  blat.connect(blatGain);
  blatGain.connect(ctx.destination);
  blat.start(now);
  blat.stop(now + 0.56);
}

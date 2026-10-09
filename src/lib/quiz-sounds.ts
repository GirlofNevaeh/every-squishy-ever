let audio: AudioContext | null = null;
let keepalive: OscillatorNode | null = null;
let keepaliveTimer: number | null = null;

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

function withSound(run: (ctx: AudioContext, now: number) => void) {
  const ctx = context();
  if (!ctx) return;
  const play = () => run(ctx, ctx.currentTime + 0.02);
  if (ctx.state === "running") {
    play();
    return;
  }
  void ctx.resume().then(() => {
    if (ctx.state === "running") play();
  });
}

export function warmAudio() {
  const ctx = context();
  if (ctx && ctx.state !== "running") void ctx.resume();
}

export function holdAudio(ms: number) {
  const ctx = context();
  if (!ctx) return;
  if (!keepalive) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 1;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    keepalive = osc;
  }
  if (keepaliveTimer) window.clearTimeout(keepaliveTimer);
  keepaliveTimer = window.setTimeout(() => {
    keepalive?.stop();
    keepalive = null;
    keepaliveTimer = null;
  }, ms);
}

export function playCheer() {
  withSound((ctx, now) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      tone(ctx, frequency, now + index * 0.09, 0.32, 0.28);
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
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.25);
  });
}

export function playFart() {
  withSound((ctx, now) => {
    const duration = 0.9;
    const length = Math.floor(ctx.sampleRate * duration);
    const noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noise.getChannelData(0);
    let brown = 0;
    let lip = 0;
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const flutter = 34 * Math.exp(-t * 1.7);
      lip += flutter / ctx.sampleRate;
      const mouth = Math.sin(2 * Math.PI * lip);
      const rasp = mouth > 0.2 ? 1 : mouth > -0.05 ? 0.22 : 0.04;
      brown = (brown + (Math.random() * 2 - 1) * 0.12) * 0.96;
      const bubble = Math.random() < 0.012 ? (Math.random() * 2 - 1) * (1 - t) : 0;
      data[i] = Math.max(-1, Math.min(1, brown * 2.8 * rasp + bubble * 0.7));
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = noise;
    filter.type = "lowpass";
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.exponentialRampToValueAtTime(48, now + 0.72);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.8, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);

    const body = ctx.createOscillator();
    const bodyFilter = ctx.createBiquadFilter();
    const bodyGain = ctx.createGain();
    body.type = "square";
    body.frequency.setValueAtTime(78, now);
    body.frequency.exponentialRampToValueAtTime(32, now + 0.62);
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(180, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(60, now + 0.62);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.66);
    body.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.start(now);
    body.stop(now + 0.68);

    const puffAt = now + 0.62;
    const puffLength = Math.floor(ctx.sampleRate * 0.22);
    const puffBuffer = ctx.createBuffer(1, puffLength, ctx.sampleRate);
    const puffData = puffBuffer.getChannelData(0);
    let puff = 0;
    for (let i = 0; i < puffData.length; i++) {
      const t = i / ctx.sampleRate;
      puff = (puff + (Math.random() * 2 - 1) * 0.2) * 0.9;
      const flap = Math.sin(2 * Math.PI * 16 * t) > 0 ? 1 : 0.15;
      puffData[i] = puff * flap;
    }
    const puffSource = ctx.createBufferSource();
    const puffFilter = ctx.createBiquadFilter();
    const puffGain = ctx.createGain();
    puffSource.buffer = puffBuffer;
    puffFilter.type = "lowpass";
    puffFilter.frequency.setValueAtTime(140, puffAt);
    puffFilter.frequency.exponentialRampToValueAtTime(50, puffAt + 0.2);
    puffGain.gain.setValueAtTime(0.0001, puffAt);
    puffGain.gain.exponentialRampToValueAtTime(0.55, puffAt + 0.02);
    puffGain.gain.exponentialRampToValueAtTime(0.0001, puffAt + 0.2);
    puffSource.connect(puffFilter);
    puffFilter.connect(puffGain);
    puffGain.connect(ctx.destination);
    puffSource.start(puffAt);
    puffSource.stop(puffAt + 0.22);
  });
}

export function playAirHorn() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const stop = now + 1;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.55, now + 0.02);
  master.gain.setValueAtTime(0.55, stop - 0.06);
  master.gain.exponentialRampToValueAtTime(0.0001, stop);
  master.connect(ctx.destination);

  for (const frequency of [415, 523, 622]) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(frequency, now);
    osc.connect(master);
    osc.start(now);
    osc.stop(stop + 0.02);
  }

  const length = Math.floor(ctx.sampleRate);
  const noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const noiseGain = ctx.createGain();
  source.buffer = noise;
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.7;
  noiseGain.gain.value = 0.35;
  source.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  source.start(now);
  source.stop(stop);
}

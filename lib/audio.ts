export class AudioEngine {
  ctx: AudioContext | null = null;
  muted = false;
  moveBuffer: AudioBuffer | null = null;
  captureBuffer: AudioBuffer | null = null;
  loadingMove = false;
  loadingCapture = false;
  moveAudioEl: HTMLAudioElement | null = null;
  captureAudioEl: HTMLAudioElement | null = null;
  private lastMoveTime = 0;
  private lastCaptureTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.moveAudioEl = new Audio('/sounds/move.mp3');
        this.moveAudioEl.preload = 'auto';
        this.moveAudioEl.volume = 1.0;
        this.moveAudioEl.setAttribute('playsinline', 'true');

        this.captureAudioEl = new Audio('/sounds/capture.mp3');
        this.captureAudioEl.preload = 'auto';
        this.captureAudioEl.volume = 1.0;
        this.captureAudioEl.setAttribute('playsinline', 'true');
      } catch {
        // Ignored in SSR
      }
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted')) {
      this.ctx.resume().catch(() => {});
    }
    this.loadAudioBuffers();
  }

  private loadAudioBuffers() {
    if (!this.ctx || typeof window === 'undefined') return;

    // Load move audio buffer directly from static sound asset
    if (!this.moveBuffer && !this.loadingMove) {
      this.loadingMove = true;
      fetch('/sounds/move.mp3')
        .then(res => res.ok ? res.arrayBuffer() : null)
        .then(arrayBuffer => arrayBuffer ? this.ctx?.decodeAudioData(arrayBuffer) : null)
        .then(decoded => {
          if (decoded) this.moveBuffer = decoded;
        })
        .catch(() => {})
        .finally(() => {
          this.loadingMove = false;
        });
    }

    // Load capture audio buffer directly from static sound asset
    if (!this.captureBuffer && !this.loadingCapture) {
      this.loadingCapture = true;
      fetch('/sounds/capture.mp3')
        .then(res => res.ok ? res.arrayBuffer() : null)
        .then(arrayBuffer => arrayBuffer ? this.ctx?.decodeAudioData(arrayBuffer) : null)
        .then(decoded => {
          if (decoded) this.captureBuffer = decoded;
        })
        .catch(() => {})
        .finally(() => {
          this.loadingCapture = false;
        });
    }
  }

  /**
   * Tạo tiếng va chạm bề mặt gỗ (wood impact click / transient)
   * Sử dụng xung nhiễu tắt dần qua bộ lọc băng thông cao tần
   */
  private createWoodClick(t: number, freq: number, q: number, gainVal: number, duration: number) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.setValueAtTime(q, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + duration);
  }

  /**
   * Tạo cộng hưởng thân gỗ đặc trưng (hardwood resonant body mode)
   */
  private createWoodTone(t: number, freq: number, gainVal: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.92), t + duration);

    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Chạm tay nhẹ vào quân cờ gỗ (Soft wooden touch)
    this.createWoodClick(t, 1800, 4.5, 0.16, 0.012);
    this.createWoodTone(t, 510, 0.18, 0.035, 'sine');
  }

  playPickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Nhấc quân cờ rời mặt bàn gỗ (Light wood lift & sliding friction)
    this.createWoodClick(t, 1400, 3.2, 0.14, 0.02);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.04);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Âm thanh di chuyển quân cờ (Non-capture moves):
   * Sử dụng duy nhất 1 âm thanh gõ gỗ chuẩn xác Soundsnap Plywood B (Plywood board hit, Node 171153).
   * Phát tức thì ngay khi quân cờ đáp xuống vị trí đích với độ trễ 0ms.
   */
  playMove() {
    if (this.muted) return;

    // Chống double-trigger trong khoảng thời gian siêu ngắn (dưới 60ms)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastMoveTime < 60) return;
    this.lastMoveTime = now;

    this.init();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // 1. Ưu tiên cao nhất: Web Audio Buffer Soundsnap Plywood B (độ trễ 0ms)
    if (this.ctx && this.moveBuffer && this.ctx.state === 'running') {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.moveBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.95, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn('WebAudio playMove source failed, falling back:', e);
      }
    }

    // 2. Dự phòng: HTMLAudioElement từ Base64 Soundsnap Plywood B
    if (this.moveAudioEl) {
      try {
        this.moveAudioEl.currentTime = 0;
        this.moveAudioEl.play().catch(() => {});
        return;
      } catch {}
    }

    // 3. Fallback: Khởi tạo audio trực tiếp từ file tĩnh /sounds/move.mp3
    if (typeof Audio !== 'undefined') {
      try {
        const directAudio = new Audio('/sounds/move.mp3');
        directAudio.volume = 0.95;
        directAudio.play().catch(() => {});
        return;
      } catch {}
    }

    // 4. Synthesizer fallback
    if (this.ctx) {
      const t = this.ctx.currentTime;
      this.createWoodClick(t, 2250, 4.5, 0.52, 0.016);
      this.createWoodTone(t, 460, 0.55, 0.055, 'triangle');
    }
  }

  /**
   * Âm thanh ăn quân (Capture moves):
   * Sử dụng chính xác âm thanh Soundsnap Plywood PS (Plywood snappy hit) do người dùng chỉ định.
   * Phát tức thì ngay khi quân cờ đáp xuống ăn quân đối phương.
   */
  playCapture() {
    if (this.muted) return;

    // Chống double-trigger trong khoảng thời gian siêu ngắn (dưới 80ms)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastCaptureTime < 80) return;
    this.lastCaptureTime = now;

    this.init();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // 1. Ưu tiên cao nhất: Web Audio API với AudioBuffer Soundsnap Plywood PS (độ trễ 0ms)
    if (this.ctx && this.captureBuffer && this.ctx.state === 'running') {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.captureBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn('WebAudio playCapture source failed, falling back:', e);
      }
    }

    // 2. Dự phòng: HTMLAudioElement từ Base64 Soundsnap Plywood PS
    if (this.captureAudioEl) {
      try {
        this.captureAudioEl.currentTime = 0;
        this.captureAudioEl.play().catch(() => {});
        return;
      } catch {}
    }

    // 3. Fallback: Khởi tạo audio trực tiếp từ file tĩnh /sounds/capture.mp3
    if (typeof Audio !== 'undefined') {
      try {
        const directAudio = new Audio('/sounds/capture.mp3');
        directAudio.volume = 1.0;
        directAudio.play().catch(() => {});
        return;
      } catch {}
    }
  }

  playCannonFire() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Heavy explosive cannon boom (low sine drop)
    const oscBoom = this.ctx.createOscillator();
    const gainBoom = this.ctx.createGain();
    oscBoom.type = 'sine';
    oscBoom.frequency.setValueAtTime(220, t);
    oscBoom.frequency.exponentialRampToValueAtTime(32, t + 0.35);
    gainBoom.gain.setValueAtTime(0.55, t);
    gainBoom.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    oscBoom.connect(gainBoom);
    gainBoom.connect(this.ctx.destination);
    oscBoom.start(t);
    oscBoom.stop(t + 0.38);

    // 2. High-energy burst noise (gunpowder explosion)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.42, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.16);

    // 3. Projectile whoosh whistling across the board
    const oscWhoosh = this.ctx.createOscillator();
    const gainWhoosh = this.ctx.createGain();
    oscWhoosh.type = 'triangle';
    oscWhoosh.frequency.setValueAtTime(520, t);
    oscWhoosh.frequency.exponentialRampToValueAtTime(1350, t + 0.18);
    oscWhoosh.frequency.exponentialRampToValueAtTime(280, t + 0.34);
    gainWhoosh.gain.setValueAtTime(0.2, t);
    gainWhoosh.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
    oscWhoosh.connect(gainWhoosh);
    gainWhoosh.connect(this.ctx.destination);
    oscWhoosh.start(t);
    oscWhoosh.stop(t + 0.34);
  }

  /**
   * Âm thanh chiến xa xung trận càn quét ("Nhất Xa sát vạn quân"):
   * Tiếng rầm rập của bánh sắt chiến xa và vó ngựa xé gió tăng tốc cực nhanh,
   * kết hợp cú va chạm đập gỗ uy lực chấn động bàn cờ khi đâm sầm vào mục tiêu.
   */
  playChariotCharge() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Tiếng gầm rú / rầm rập của chiến xa lao tốc hành (Accelerating chariot roar & iron rumble)
    const oscRumble = this.ctx.createOscillator();
    const gainRumble = this.ctx.createGain();
    oscRumble.type = 'sawtooth';
    oscRumble.frequency.setValueAtTime(80, t);
    oscRumble.frequency.exponentialRampToValueAtTime(260, t + 0.22);
    oscRumble.frequency.exponentialRampToValueAtTime(60, t + 0.38);

    const filterRumble = this.ctx.createBiquadFilter();
    filterRumble.type = 'lowpass';
    filterRumble.frequency.setValueAtTime(320, t);
    filterRumble.frequency.exponentialRampToValueAtTime(950, t + 0.22);
    filterRumble.frequency.exponentialRampToValueAtTime(220, t + 0.38);

    gainRumble.gain.setValueAtTime(0.38, t);
    gainRumble.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    oscRumble.connect(filterRumble);
    filterRumble.connect(gainRumble);
    gainRumble.connect(this.ctx.destination);
    oscRumble.start(t);
    oscRumble.stop(t + 0.38);

    // 2. Tiếng xé gió rít mạnh dọc đường càn quét (High-velocity wind rush)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(600, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(2200, t + 0.20);
    noiseFilter.frequency.exponentialRampToValueAtTime(400, t + 0.30);
    noiseFilter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.30);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.30);

    // 3. Tiếng đâm sầm va chạm gỗ đặc ruột uy lực khi chạm đích (Heavy wood impact at arrival)
    const tImpact = t + 0.22;
    this.createWoodClick(tImpact, 2600, 3.5, 0.70, 0.025);
    this.createWoodTone(tImpact, 420, 0.65, 0.07, 'triangle');
    this.createWoodTone(tImpact, 175, 0.58, 0.11, 'sine');
  }

  /**
   * Âm thanh Chiến Mã ăn quân đối phương:
   * Tái hiện chính xác âm thanh gậy sắt đánh bóng do người dùng cung cấp:
   * 1. Xung kích tiếp xúc đanh gọn tức thì (Crisp high-frequency transient click)
   * 2. Thân âm cộng hưởng "BỐC / CỐP" rỗng và đặc trưng của bóng (Resonant hollow-core pop)
   * 3. Tiếng nảy nhẹ tự nhiên ở đuôi âm (Subtle natural rebound / settling tick)
   * Tuyệt đối không có tiếng ngựa hí.
   */
  playHorseKick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Xung tiếp xúc đanh thép (Sharp clubface to ball impact click)
    this.createWoodClick(t, 4600, 5.8, 0.95, 0.012);
    this.createWoodClick(t, 2900, 4.2, 0.70, 0.016);

    // 2. Thân âm cộng hưởng "BỐC / CỐP" chính (Primary hollow ball pop & cavity resonance)
    // Tần số dao động 520Hz trượt êm xuống 380Hz với độ vang tự nhiên
    const oscPop = this.ctx.createOscillator();
    const gainPop = this.ctx.createGain();
    oscPop.type = 'triangle';
    oscPop.frequency.setValueAtTime(520, t);
    oscPop.frequency.exponentialRampToValueAtTime(360, t + 0.14);

    gainPop.gain.setValueAtTime(0.92, t);
    gainPop.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    oscPop.connect(gainPop);
    gainPop.connect(this.ctx.destination);
    oscPop.start(t);
    oscPop.stop(t + 0.14);

    // Hài âm thứ cấp tạo độ trong và đanh của tiếng bóng nén (Overtone ring)
    const oscHarmonic = this.ctx.createOscillator();
    const gainHarmonic = this.ctx.createGain();
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(1040, t);
    oscHarmonic.frequency.exponentialRampToValueAtTime(780, t + 0.08);

    gainHarmonic.gain.setValueAtTime(0.45, t);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(this.ctx.destination);
    oscHarmonic.start(t);
    oscHarmonic.stop(t + 0.08);

    // Thân trầm chắc nịch (Solid low-end core punch)
    const oscBass = this.ctx.createOscillator();
    const gainBass = this.ctx.createGain();
    oscBass.type = 'sine';
    oscBass.frequency.setValueAtTime(210, t);
    oscBass.frequency.exponentialRampToValueAtTime(90, t + 0.12);

    gainBass.gain.setValueAtTime(0.68, t);
    gainBass.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    oscBass.connect(gainBass);
    gainBass.connect(this.ctx.destination);
    oscBass.start(t);
    oscBass.stop(t + 0.12);

    // 3. Tiếng nảy nhẹ tự nhiên ở đuôi âm (Subtle natural rebound settle tick at t + 0.095s)
    const tRebound = t + 0.095;
    this.createWoodClick(tRebound, 2400, 3.8, 0.28, 0.015);
    this.createWoodTone(tRebound, 440, 0.22, 0.045, 'triangle');
  }

  playCheck() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [587.33, 880, 1174.66].forEach(freq => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    [587.33, 554.37, 523.25, 493.88].forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playIllegal() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playDraw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playCountdown() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

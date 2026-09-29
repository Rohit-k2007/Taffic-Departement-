/**
 * NATDAMS - Live Telemetry & Simulation Engine
 * Powers real-time vehicle ANPR detection, signal timers, radar alerts, and telemetry jitter
 */

class LiveTelemetryEngine {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.tickCount = 0;
    this.soundEnabled = true;

    // Live Metrics
    this.metrics = {
      activeVehicles: 184520,
      avgSpeedKmh: 42.6,
      radarGantriesOnline: 142,
      activePatrols: 34,
      networkCongestionIndex: 38, // 0 - 100%
      carbonPpm: 412
    };

    // Diverse Pan-India simulated pool of plates
    this.samplePlates = [
      { plate: "DL-01-AB-4921", limit: 60, status: "VIOLATION_OVERSPEED" },
      { plate: "RJ-14-CC-4001", limit: 50, status: "VIOLATION_OVERSPEED" },
      { plate: "MH-12-DE-9944", limit: 60, status: "OK" },
      { plate: "KA-05-MN-2210", limit: 50, status: "OK" },
      { plate: "UP-16-BZ-5501", limit: 70, status: "VIOLATION_OVERSPEED" },
      { plate: "TN-01-AX-7722", limit: 60, status: "OK" },
      { plate: "GJ-01-KH-3311", limit: 60, status: "OK" },
      { plate: "WB-01-JJ-4422", limit: 50, status: "OK" },
      { plate: "PB-10-TR-8811", limit: 60, status: "VIOLATION_OVERSPEED" },
      { plate: "KL-07-ZZ-9900", limit: 50, status: "OK" },
      { plate: "RJ-19-UA-8821", limit: 50, status: "VIOLATION_OVERSPEED" },
      { plate: "RJ-20-KK-1122", limit: 50, status: "OK" },
      { plate: "MH-01-AA-1000", limit: 60, status: "OK" },
      { plate: "TS-09-XY-3412", limit: 60, status: "OK" },
      { plate: "MP-09-BC-4455", limit: 50, status: "VIOLATION_OVERSPEED" },
      { plate: "HR-26-DF-1092", limit: 60, status: "OK" }
    ];

    this.audioContext = null;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => this.tick(), 1500);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
  }

  tick() {
    this.tickCount++;

    // 1. Advance Signals Countdown
    this.advanceSignals();

    // 2. Metrics Jitter
    this.updateMetrics();

    // 3. ANPR Camera Detection trigger every 3-4 ticks
    if (this.tickCount % 3 === 0) {
      this.generateAnprEvent();
    }

    // Dispatch global tick event
    window.dispatchEvent(new CustomEvent('traffic-tick', { 
      detail: { 
        metrics: this.metrics, 
        tick: this.tickCount 
      } 
    }));
  }

  advanceSignals() {
    if (!window.trafficDB) return;
    const signals = window.trafficDB.getSignals();
    let updated = false;

    signals.forEach(sig => {
      // If VIP green corridor is active, freeze at green
      if (sig.vipGreenCorridor) {
        sig.currentPhase = 'green';
        sig.timerRemaining = 99;
        return;
      }

      sig.timerRemaining--;
      if (sig.timerRemaining <= 0) {
        updated = true;
        if (sig.currentPhase === 'green') {
          sig.currentPhase = 'yellow';
          sig.timerRemaining = 5;
        } else if (sig.currentPhase === 'yellow') {
          sig.currentPhase = 'red';
          sig.timerRemaining = 40;
        } else {
          sig.currentPhase = 'green';
          sig.timerRemaining = 35;
        }
      }
    });

    localStorage.setItem(STORAGE_KEYS.SIGNALS, JSON.stringify(signals));
    window.dispatchEvent(new CustomEvent('signals-updated', { detail: signals }));
  }

  updateMetrics() {
    const deltaVehicles = Math.floor((Math.random() - 0.48) * 40);
    this.metrics.activeVehicles = Math.max(150000, this.metrics.activeVehicles + deltaVehicles);

    const speedDelta = (Math.random() - 0.5) * 0.4;
    this.metrics.avgSpeedKmh = Math.max(30, Math.min(65, +(this.metrics.avgSpeedKmh + speedDelta).toFixed(1)));

    const congestionDelta = (Math.random() - 0.5) * 1.5;
    this.metrics.networkCongestionIndex = Math.max(15, Math.min(85, Math.round(this.metrics.networkCongestionIndex + congestionDelta)));
  }

  generateAnprEvent() {
    const item = this.samplePlates[Math.floor(Math.random() * this.samplePlates.length)];
    
    // Use Telemetry Vault to resolve rich, diverse owner and location
    const vehicle = window.telemetryVault 
      ? window.telemetryVault.resolveVehicleDetails(item.plate)
      : { 
          owner: "Registered Vehicle Owner", 
          makeModel: "Sedan (4-Wheeler)", 
          class: "Passenger Vehicle", 
          districtName: "National Highway Corridor", 
          corridor: "Main Arterial", 
          ipAddress: "10.42.18.91" 
        };

    const actualSpeed = item.status.includes('VIOLATION') 
      ? item.limit + 15 + Math.floor(Math.random() * 22)
      : Math.floor(item.limit * 0.75 + Math.random() * 12);

    const isViolation = actualSpeed > item.limit;
    const event = {
      id: "ANPR-" + Math.floor(1000 + Math.random() * 9000),
      plate: item.plate,
      vehicleType: vehicle.makeModel,
      vehicleClass: vehicle.class,
      ownerName: vehicle.owner,
      location: vehicle.districtName,
      corridor: vehicle.corridor,
      speed: actualSpeed,
      speedLimit: item.limit,
      isViolation: isViolation,
      ipAddress: vehicle.ipAddress,
      camera: `${vehicle.stateCode || 'DL'}-RADAR-G${Math.floor(1 + Math.random() * 8)}`,
      timestamp: new Date().toLocaleTimeString()
    };

    if (isViolation && this.soundEnabled) {
      this.playTacticalChime();
    }

    window.dispatchEvent(new CustomEvent('anpr-detection', { detail: event }));
  }

  playTacticalChime() {
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioContext = new AudioContext();
      }
      if (this.audioContext && this.audioContext.state === 'running') {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
      }
    } catch (e) {
      // Audio playback restrictions fallback
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.soundEnabled;
  }
}

// Global instance
window.liveEngine = new LiveTelemetryEngine();

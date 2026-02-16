/**
 * Audio system for Pandu
 * Handles procedural sound generation and haptic feedback
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.musicGain = null;
        this.sfxGain = null;

        // Initialize on user interaction (required by browsers)
        this.initialized = false;
    }

    /**
     * Initialize Web Audio API (call on first user interaction)
     */
    initialize() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes for volume control
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.audioContext.destination);

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.audioContext.destination);

            this.initialized = true;
            this.startAmbientMusic();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    /**
     * Play merge sound effect
     * Higher planets = lower frequency, more resonant
     */
    playMergeSound(planetId) {
        if (!this.enabled || !this.initialized) return;

        const now = this.audioContext.currentTime;

        // Base frequency decreases with planet size
        const baseFreq = 800 - (planetId * 50);

        // Create oscillator for main tone
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.3);

        // Create envelope
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.3, now + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        // Add harmonic for richness
        const harmonic = this.audioContext.createOscillator();
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(baseFreq * 2, now);

        const harmonicGain = this.audioContext.createGain();
        harmonicGain.gain.setValueAtTime(0.1, now);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        // Connect nodes
        osc.connect(envelope);
        harmonic.connect(harmonicGain);
        envelope.connect(this.sfxGain);
        harmonicGain.connect(this.sfxGain);

        // Play
        osc.start(now);
        harmonic.start(now);
        osc.stop(now + 0.3);
        harmonic.stop(now + 0.2);
    }

    /**
     * Play drop sound
     */
    playDropSound() {
        if (!this.enabled || !this.initialized) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0.2, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(envelope);
        envelope.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * Start ambient space music
     */
    startAmbientMusic() {
        if (!this.enabled || !this.initialized) return;

        // Create a subtle, evolving ambient drone
        const now = this.audioContext.currentTime;

        // Low drone
        const drone = this.audioContext.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(55, now); // Low A

        const droneGain = this.audioContext.createGain();
        droneGain.gain.setValueAtTime(0.15, now);

        // Add slow LFO for subtle movement
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, now);

        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.setValueAtTime(5, now);

        lfo.connect(lfoGain);
        lfoGain.connect(drone.frequency);

        drone.connect(droneGain);
        droneGain.connect(this.musicGain);

        drone.start(now);
        lfo.start(now);
    }

    /**
     * Trigger haptic feedback (mobile)
     */
    triggerHaptic(intensity = 1) {
        if (navigator.vibrate) {
            const duration = Math.min(50, intensity * 20);
            navigator.vibrate(duration);
        }
    }

    /**
     * Play game over sound
     */
    playGameOverSound() {
        if (!this.enabled || !this.initialized) return;

        const now = this.audioContext.currentTime;

        // Descending tone sequence
        const frequencies = [440, 392, 349, 294];

        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.2);

            const envelope = this.audioContext.createGain();
            envelope.gain.setValueAtTime(0, now + i * 0.2);
            envelope.gain.linearRampToValueAtTime(0.2, now + i * 0.2 + 0.05);
            envelope.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3);

            osc.connect(envelope);
            envelope.connect(this.sfxGain);

            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.3);
        });
    }

    /**
     * Toggle audio on/off
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

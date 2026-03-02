// =======================
// SOUND ENGINE FOR JOHN CAGE PROJECT
// =======================
// Generates procedural sounds using Web Audio API
// - Short sounds for dot creation
// - Longer sounds for rearrangement transitions

class CageSoundEngine {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        
        // Initialize audio context on first user interaction
        this.initAudioContext();
    }
    
    initAudioContext() {
        // Web Audio API requires user interaction to start
        // We'll initialize it lazily on first sound play
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (err) {
            console.warn('Web Audio API not supported:', err);
        }
    }
    
    // Get a unique hash for a label (for consistent sound signature)
    getLabelHash(label) {
        let hash = 0;
        for (let i = 0; i < label.length; i++) {
            hash = ((hash << 5) - hash) + label.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    
    // Get a sound profile for specific labels to make some tones softer
    getSoundProfile(label) {
        const gentle = ['John', 'Cage', 'Imaginary Landscape No. 1', 'Imaginary Landscape No. 5'];
        if (gentle.includes(label)) {
            return {
                minFreq: 240,
                maxFreq: 520,
                volume: 0.18,
                type: 'sine',
                attackCap: 0.06,
                releaseCap: 0.12
            };
        }
        return {
            minFreq: 220,
            maxFreq: 880,
            volume: 0.3,
            type: null,
            attackCap: 0.1,
            releaseCap: 0.15
        };
    }
    
    // Get a unique frequency/pitch for each label within profile range
    getFrequencyForLabel(label, profile) {
        const hash = this.getLabelHash(label);
        const normalizedHash = hash % 1000 / 1000;
        const minF = profile?.minFreq ?? 220;
        const maxF = profile?.maxFreq ?? 880;
        return minF + (maxF - minF) * normalizedHash;
    }
    
    // Get oscillator type for a label (part of signature sound)
    getOscillatorTypeForLabel(label, profile) {
        if (profile?.type) return profile.type;
        const hash = this.getLabelHash(label);
        const types = ['sine', 'triangle', 'square', 'sawtooth'];
        return types[hash % types.length];
    }
    
    // Get envelope characteristics for a label (part of signature sound)
    getEnvelopeForLabel(label, duration, profile) {
        const hash = this.getLabelHash(label);
        
        // Different attack/release ratios for different labels
        const attackRatio = 0.05 + (hash % 10) / 100; // 0.05 to 0.15
        const releaseRatio = 0.1 + (hash % 15) / 100; // 0.1 to 0.25
        const attackCap = profile?.attackCap ?? 0.1;
        const releaseCap = profile?.releaseCap ?? 0.15;
        
        return {
            attackTime: Math.min(duration * attackRatio, attackCap),
            releaseTime: Math.min(duration * releaseRatio, releaseCap)
        };
    }
    
    // Generate a tone with envelope (using label-specific signature)
    playTone(label, frequency, duration, volume = 0.3, profile = null) {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            // Try to resume if suspended
            this.audioContext?.resume().catch(() => {});
            return;
        }
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Use label-specific oscillator type for signature sound
        oscillator.type = this.getOscillatorTypeForLabel(label, profile);
        oscillator.frequency.setValueAtTime(frequency, now);
        
        // Get label-specific envelope characteristics
        const envelope = this.getEnvelopeForLabel(label, duration, profile);
        const attackTime = envelope.attackTime;
        const releaseTime = envelope.releaseTime;
        const sustainTime = duration - attackTime - releaseTime;
        
        // Envelope: fade in, sustain, fade out
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
        gainNode.gain.setValueAtTime(volume, now + attackTime + sustainTime);
        gainNode.gain.linearRampToValueAtTime(0, now + attackTime + sustainTime + releaseTime);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    // Play transition sound for a label
    // duration: in seconds (e.g., 0.15 for short, 0.8 for long)
    playTransitionSound(label, duration) {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        const profile = this.getSoundProfile(label);
        const frequency = this.getFrequencyForLabel(label, profile);
        const volume = profile.volume;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this.playTone(label, frequency, duration, volume, profile);
            }).catch(() => {
                // If resume fails, try to play anyway
                this.playTone(label, frequency, duration, volume, profile);
            });
        } else {
            this.playTone(label, frequency, duration, volume, profile);
        }
    }
    
    // Play a longer sound for rearrangement (uses the selected label)
    // Uses the same signature sound as the label, just longer duration
    playRearrangementSound(label, duration) {
        if (!this.initialized) {
            this.initAudioContext();
        }
        
        const profile = this.getSoundProfile(label);
        const frequency = this.getFrequencyForLabel(label, profile);
        const volume = Math.min(profile.volume, 0.25);
        
        if (!this.audioContext || this.audioContext.state === 'suspended') {
            this.audioContext?.resume().then(() => {
                this.playTone(label, frequency, duration, volume, profile);
            }).catch(() => {
                this.playTone(label, frequency, duration, volume, profile);
            });
        } else {
            this.playTone(label, frequency, duration, volume, profile);
        }
    }
}

// Create global instance
const cageSoundEngine = new CageSoundEngine();


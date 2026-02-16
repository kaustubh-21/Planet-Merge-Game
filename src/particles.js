/**
 * Particle system for merge effects
 * Handles implosion particles, shockwaves, and screen shake
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.shockwaves = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    }

    /**
     * Create implosion effect at merge point
     */
    createMergeEffect(x, y, oldPlanetId, newPlanetId) {
        // Create implosion particles
        const particleCount = 20 + (oldPlanetId * 5);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 4,
                color: this.getParticleColor(newPlanetId)
            });
        }

        // Create shockwave
        this.shockwaves.push({
            x,
            y,
            radius: 0,
            maxRadius: 50 + (oldPlanetId * 10),
            speed: 5,
            life: 1.0,
            decay: 0.05,
            color: this.getParticleColor(newPlanetId)
        });

        // Trigger screen shake for large merges (Jupiter and above)
        if (newPlanetId >= 6) {
            this.triggerScreenShake(newPlanetId - 5);
        }
    }

    /**
     * Get particle color based on planet ID
     */
    getParticleColor(planetId) {
        const colors = [
            '#C0C0C0', // Moon
            '#8C7853', // Mercury
            '#CD5C5C', // Mars
            '#4169E1', // Earth
            '#4682B4', // Neptune
            '#DAA520', // Saturn
            '#D2691E', // Jupiter
            '#FFA500', // Sun
            '#00BFFF', // Sirius
            '#8B00FF', // Black Hole
            '#FF1493'  // Supernova
        ];
        return colors[planetId] || '#FFFFFF';
    }

    /**
     * Trigger screen shake effect
     */
    triggerScreenShake(intensity) {
        this.screenShake.intensity = Math.min(intensity * 2, 10);
        this.screenShake.duration = 300; // milliseconds
    }

    /**
     * Update all particles and effects
     */
    update(deltaTime = 16.67) {
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Slight gravity
            particle.life -= particle.decay;
            return particle.life > 0;
        });

        // Update shockwaves
        this.shockwaves = this.shockwaves.filter(wave => {
            wave.radius += wave.speed;
            wave.life -= wave.decay;
            return wave.life > 0 && wave.radius < wave.maxRadius;
        });

        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            const progress = this.screenShake.duration / 300;
            const intensity = this.screenShake.intensity * progress;

            this.screenShake.x = (Math.random() - 0.5) * intensity;
            this.screenShake.y = (Math.random() - 0.5) * intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.screenShake.intensity = 0;
        }
    }

    /**
     * Render particles to canvas
     */
    render(ctx) {
        // Render particles
        for (let particle of this.particles) {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Render shockwaves
        for (let wave of this.shockwaves) {
            ctx.save();
            ctx.globalAlpha = wave.life * 0.5;
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    /**
     * Get current screen shake offset
     */
    getScreenShake() {
        return { x: this.screenShake.x, y: this.screenShake.y };
    }

    /**
     * Clear all particles and effects
     */
    clear() {
        this.particles = [];
        this.shockwaves = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    }
}

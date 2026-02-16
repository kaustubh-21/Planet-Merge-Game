/**
 * Canvas renderer for Pandu
 * Handles drawing planets with textures, glow effects, and special features
 */

import { getPlanetById } from './planets.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = this.generateStarfield();
    }

    /**
     * Generate random starfield background
     */
    generateStarfield() {
        const stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.02 + Math.random() * 0.03
            });
        }
        return stars;
    }

    /**
     * Clear and prepare canvas for new frame
     */
    clear() {
        // Deep space background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0015');
        gradient.addColorStop(0.5, '#1a0033');
        gradient.addColorStop(1, '#0f001a');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render animated starfield
     */
    renderStarfield(time) {
        for (let star of this.stars) {
            const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
            this.ctx.save();
            this.ctx.globalAlpha = star.opacity * twinkle;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Draw a planet with glow and texture
     */
    drawPlanet(body) {
        const config = body.planetConfig;
        if (!config) return;

        const x = body.position.x;
        const y = body.position.y;
        const radius = config.radius;

        this.ctx.save();

        // Draw outer glow
        this.drawGlow(x, y, radius, config.glowColor);

        // Draw planet body
        this.drawPlanetBody(x, y, radius, config);

        // Draw special features
        if (config.hasRings) {
            this.drawRings(x, y, radius, config.color);
        }

        if (config.hasAccretionDisk) {
            this.drawAccretionDisk(x, y, radius);
        }

        this.ctx.restore();
    }

    /**
     * Draw glowing halo around planet
     */
    drawGlow(x, y, radius, color) {
        const gradient = this.ctx.createRadialGradient(x, y, radius, x, y, radius * 1.5);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(0.5, color + '20');
        gradient.addColorStop(1, color + '00');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw planet body with texture
     */
    drawPlanetBody(x, y, radius, config) {
        // Main planet gradient
        const gradient = this.ctx.createRadialGradient(
            x - radius * 0.3,
            y - radius * 0.3,
            radius * 0.1,
            x,
            y,
            radius
        );

        gradient.addColorStop(0, this.lightenColor(config.color, 40));
        gradient.addColorStop(0.7, config.color);
        gradient.addColorStop(1, this.darkenColor(config.color, 30));

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Add texture based on planet type
        this.addTexture(x, y, radius, config);

        // Add atmospheric rim light for gas planets
        if (config.texture === 'gas' || config.texture === 'gas-giant' || config.texture === 'earth') {
            this.drawAtmosphere(x, y, radius, config.glowColor);
        }
    }

    /**
     * Add procedural texture to planet
     */
    addTexture(x, y, radius, config) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;

        // Create clipping region
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.clip();

        // Draw texture patterns
        if (config.texture === 'crater') {
            // Moon craters
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius * 0.7;
                const cx = x + Math.cos(angle) * dist;
                const cy = y + Math.sin(angle) * dist;
                const cr = radius * 0.1 + Math.random() * radius * 0.15;

                this.ctx.fillStyle = this.darkenColor(config.color, 20);
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, cr, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else if (config.texture === 'gas' || config.texture === 'gas-giant') {
            // Gas bands
            for (let i = 0; i < 5; i++) {
                this.ctx.strokeStyle = this.darkenColor(config.color, 10 + i * 5);
                this.ctx.lineWidth = radius * 0.15;
                this.ctx.beginPath();
                this.ctx.arc(x, y + (i - 2) * radius * 0.3, radius * 1.2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }

        this.ctx.restore();
    }

    /**
     * Draw atmospheric rim
     */
    drawAtmosphere(x, y, radius, color) {
        const gradient = this.ctx.createRadialGradient(x, y, radius * 0.85, x, y, radius);
        gradient.addColorStop(0, color + '00');
        gradient.addColorStop(1, color + '60');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = radius * 0.15;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.92, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Draw Saturn-style rings
     */
    drawRings(x, y, radius, color) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.7;

        // Flatten rings with scale
        this.ctx.translate(x, y);
        this.ctx.scale(1, 0.3);
        this.ctx.translate(-x, -y);

        // Draw multiple ring bands
        const ringColor = this.lightenColor(color, 20);

        for (let i = 0; i < 3; i++) {
            const innerRadius = radius * (1.3 + i * 0.15);
            const outerRadius = radius * (1.4 + i * 0.15);

            this.ctx.strokeStyle = ringColor;
            this.ctx.lineWidth = outerRadius - innerRadius;
            this.ctx.beginPath();
            this.ctx.arc(x, y, (innerRadius + outerRadius) / 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    /**
     * Draw black hole accretion disk
     */
    drawAccretionDisk(x, y, radius) {
        this.ctx.save();

        // Flatten disk
        this.ctx.translate(x, y);
        this.ctx.scale(1, 0.25);
        this.ctx.translate(-x, -y);

        // Glowing disk gradient
        const gradient = this.ctx.createRadialGradient(x, y, radius, x, y, radius * 2);
        gradient.addColorStop(0, '#8B00FF80');
        gradient.addColorStop(0.5, '#FF1493 60');
        gradient.addColorStop(1, '#8B00FF00');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw event horizon line
     */
    drawEventHorizon(y) {
        this.ctx.save();
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Utility: Lighten a hex color
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    /**
     * Utility: Darken a hex color
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

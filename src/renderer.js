/**
 * Premium Canvas Renderer for Pandu
 * Ultra-detailed rendering with realistic planets, nebulae, and 3D container
 * Provides a shared drawPlanetAt() method for consistent planet rendering
 */

import { getPlanetById, PLANETS } from './planets.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = this.generateStarfield();
        this.nebulaClouds = this.generateNebulaClouds();
        this.time = 0;
    }

    // Generate rich multi-layered starfield
    generateStarfield() {
        const stars = [];
        // Far distant stars
        for (let i = 0; i < 120; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 0.8 + 0.2,
                opacity: 0.2 + Math.random() * 0.3,
                twinkleSpeed: 0.005 + Math.random() * 0.01,
                color: '#ffffff',
                layer: 'far'
            });
        }
        // Mid-range stars with color
        for (let i = 0; i < 40; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1 + 0.5,
                opacity: 0.4 + Math.random() * 0.3,
                twinkleSpeed: 0.008 + Math.random() * 0.015,
                color: ['#ffffff', '#aaccff', '#ffccaa', '#ffddbb'][Math.floor(Math.random() * 4)],
                layer: 'mid'
            });
        }
        // Bright foreground stars with cross spikes
        for (let i = 0; i < 15; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                opacity: 0.7 + Math.random() * 0.3,
                twinkleSpeed: 0.015 + Math.random() * 0.02,
                color: ['#ffffff', '#aaccff', '#ffccaa'][Math.floor(Math.random() * 3)],
                hasCross: Math.random() > 0.5,
                layer: 'near'
            });
        }
        return stars;
    }

    // Generate soft nebula clouds
    generateNebulaClouds() {
        const clouds = [];
        const nebColors = [
            'rgba(90, 30, 160, 0.03)',
            'rgba(30, 60, 160, 0.025)',
            'rgba(160, 30, 80, 0.02)',
            'rgba(30, 130, 160, 0.02)'
        ];
        for (let i = 0; i < 6; i++) {
            clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 80 + Math.random() * 150,
                color: nebColors[Math.floor(Math.random() * nebColors.length)]
            });
        }
        return clouds;
    }

    // Clear canvas with deep space gradient
    clear() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#020010');
        grad.addColorStop(0.5, '#050520');
        grad.addColorStop(1, '#030015');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Render nebula clouds
    renderNebulae() {
        for (let cloud of this.nebulaClouds) {
            const grad = this.ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.radius
            );
            grad.addColorStop(0, cloud.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Render rich animated starfield
    renderStarfield(time) {
        this.time = time || 0;
        for (let star of this.stars) {
            const twinkle = 0.5 + 0.5 * Math.sin(this.time * star.twinkleSpeed + star.x);
            const alpha = star.opacity * twinkle;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Cross diffraction spikes on bright stars
            if (star.hasCross && alpha > 0.5) {
                this.ctx.globalAlpha = alpha * 0.3;
                this.ctx.strokeStyle = star.color;
                this.ctx.lineWidth = 0.5;
                const spikeLen = star.size * 4;
                this.ctx.beginPath();
                this.ctx.moveTo(star.x - spikeLen, star.y);
                this.ctx.lineTo(star.x + spikeLen, star.y);
                this.ctx.moveTo(star.x, star.y - spikeLen);
                this.ctx.lineTo(star.x, star.y + spikeLen);
                this.ctx.stroke();
            }
        }
        this.ctx.globalAlpha = 1;
    }

    /**
     * SHARED planet rendering — used by renderer, UI indicator, preview, and hierarchy
     * Draws a planet with realistic lighting, textures, and effects at any position/size
     */
    drawPlanetAt(x, y, radius, planetId, angle = 0) {
        const config = getPlanetById(planetId);
        if (!config) return;

        const ctx = this.ctx;
        ctx.save();

        // Ambient glow
        const glowGrad = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.8);
        glowGrad.addColorStop(0, config.glowColor + '20');
        glowGrad.addColorStop(1, config.glowColor + '00');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Clip to planet circle for textures
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();

        // Base color fill
        const baseGrad = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, radius * 0.05,
            x, y, radius
        );
        baseGrad.addColorStop(0, this.lightenColor(config.color, 25));
        baseGrad.addColorStop(0.5, config.color);
        baseGrad.addColorStop(1, this.darkenColor(config.color, 30));
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Surface texture
        this.drawSurfaceTexture(x, y, radius, config, angle);

        // 3D lighting — light from top-left
        const lightX = x - radius * 0.35;
        const lightY = y - radius * 0.35;
        const lightGrad = ctx.createRadialGradient(
            lightX, lightY, radius * 0.05,
            x, y, radius
        );
        lightGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
        lightGrad.addColorStop(0.3, 'rgba(255,255,255,0.06)');
        lightGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
        lightGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

        // Terminator line shadow
        const termGrad = ctx.createLinearGradient(
            x - radius * 0.2, y, x + radius, y
        );
        termGrad.addColorStop(0, 'rgba(0,0,0,0)');
        termGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
        termGrad.addColorStop(0.85, 'rgba(0,0,0,0.2)');
        termGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = termGrad;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

        ctx.restore(); // Unclip

        // Rings for Saturn
        if (config.hasRings) {
            this.drawDetailedRings(x, y, radius, config);
        }

        // Atmospheric rim for gas planets + Earth
        if (['gas', 'gas-giant', 'earth'].includes(config.texture)) {
            this.drawAtmosphericRim(x, y, radius, config);
        }

        // Sun: extra corona glow
        if (config.isLuminous) {
            this.drawCoronaGlow(x, y, radius);
        }

        ctx.restore();
    }

    // Draw planet from a physics body
    drawPlanet(body) {
        const config = body.planetConfig;
        if (!config) return;
        this.drawPlanetAt(body.position.x, body.position.y, config.radius, config.id, body.angle);
    }

    // ===== Surface Texture Methods =====

    drawSurfaceTexture(x, y, radius, config, angle) {
        switch (config.texture) {
            case 'rocky':
                this.drawRockyTexture(x, y, radius, config);
                break;
            case 'dusty':
                this.drawMarsTexture(x, y, radius, config);
                break;
            case 'venus':
                this.drawVenusTexture(x, y, radius, config);
                break;
            case 'earth':
                this.drawEarthTexture(x, y, radius, config);
                break;
            case 'gas':
                this.drawGasBands(x, y, radius, config);
                break;
            case 'gas-giant':
                this.drawJupiterTexture(x, y, radius, config);
                break;
            case 'star':
                this.drawStarTexture(x, y, radius, config);
                break;
        }
    }

    // Mercury — rocky with craters
    drawRockyTexture(x, y, radius, config) {
        const ctx = this.ctx;
        const seed = 42;
        // Rocky scratches
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            const a = (seed + i * 73) % 360 * Math.PI / 180;
            const r = radius * 0.3 + (i * 17 % 50) / 100 * radius * 0.5;
            const sx = x + Math.cos(a) * r;
            const sy = y + Math.sin(a) * r;
            ctx.beginPath();
            ctx.arc(sx, sy, radius * 0.06 + i * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Craters
        const craterPositions = [
            { a: 0.5, r: 0.3, s: 0.12 },
            { a: 2.0, r: 0.5, s: 0.08 },
            { a: 4.0, r: 0.2, s: 0.15 },
            { a: 5.5, r: 0.6, s: 0.06 },
        ];
        for (let c of craterPositions) {
            const cx = x + Math.cos(c.a) * radius * c.r;
            const cy = y + Math.sin(c.a) * radius * c.r;
            const cr = radius * c.s;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.arc(cx + 1, cy + 1, cr, 0, Math.PI * 2);
            ctx.fill();
            // Crater
            ctx.fillStyle = this.darkenColor(config.color, 15);
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
            // Highlight rim
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(cx - 0.5, cy - 0.5, cr, -0.5, 1.5);
            ctx.stroke();
        }
    }

    // Mars — reddish with ice cap and dark terrain patches
    drawMarsTexture(x, y, radius, config) {
        const ctx = this.ctx;
        // Dark terrain patches
        const patches = [
            { a: 1.2, r: 0.4, s: 0.3 },
            { a: 3.5, r: 0.3, s: 0.25 },
            { a: 5.0, r: 0.5, s: 0.2 },
        ];
        for (let p of patches) {
            const px = x + Math.cos(p.a) * radius * p.r;
            const py = y + Math.sin(p.a) * radius * p.r;
            ctx.fillStyle = 'rgba(100, 40, 30, 0.25)';
            ctx.beginPath();
            ctx.ellipse(px, py, radius * p.s, radius * p.s * 0.6, p.a, 0, Math.PI * 2);
            ctx.fill();
        }
        // North ice cap
        ctx.fillStyle = 'rgba(220, 235, 245, 0.5)';
        ctx.beginPath();
        ctx.ellipse(x, y - radius * 0.8, radius * 0.35, radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Valles canyon
        ctx.strokeStyle = 'rgba(80, 30, 20, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.4, y + radius * 0.1);
        ctx.quadraticCurveTo(x, y - radius * 0.1, x + radius * 0.3, y + radius * 0.2);
        ctx.stroke();
    }

    // Venus — thick cloudy atmosphere swirls
    drawVenusTexture(x, y, radius, config) {
        const ctx = this.ctx;
        // Cloud bands
        for (let i = 0; i < 5; i++) {
            const bandY = y - radius + (i + 0.5) * (radius * 2 / 5);
            const bandH = radius * 0.12;
            ctx.fillStyle = `rgba(230, 200, 120, ${0.1 + i * 0.03})`;
            ctx.beginPath();
            ctx.ellipse(x, bandY, radius * 0.9, bandH, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Swirl patterns
        ctx.strokeStyle = 'rgba(200, 170, 80, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + radius * 0.2, y, radius * 0.4, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.3, 0.5, 2.5);
        ctx.stroke();
    }

    // Earth — continents, oceans, clouds
    drawEarthTexture(x, y, radius, config) {
        const ctx = this.ctx;
        // Continents
        const continents = [
            // Americas
            [
                [x - radius * 0.35, y - radius * 0.3],
                [x - radius * 0.4, y - radius * 0.1],
                [x - radius * 0.3, y + radius * 0.15],
                [x - radius * 0.2, y + radius * 0.1],
                [x - radius * 0.25, y - radius * 0.15],
            ],
            // Eurasia
            [
                [x + radius * 0.05, y - radius * 0.4],
                [x + radius * 0.35, y - radius * 0.35],
                [x + radius * 0.4, y - radius * 0.15],
                [x + radius * 0.15, y - radius * 0.1],
            ],
            // Africa
            [
                [x + radius * 0.1, y],
                [x + radius * 0.2, y + radius * 0.05],
                [x + radius * 0.15, y + radius * 0.35],
                [x + radius * 0.05, y + radius * 0.25],
            ],
        ];

        ctx.fillStyle = '#2d8a4e';
        for (let cont of continents) {
            ctx.beginPath();
            ctx.moveTo(cont[0][0], cont[0][1]);
            for (let i = 1; i < cont.length; i++) {
                ctx.lineTo(cont[i][0], cont[i][1]);
            }
            ctx.closePath();
            ctx.fill();
        }

        // Cloud wisps
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const cy = y - radius * 0.5 + i * radius * 0.3;
            ctx.beginPath();
            ctx.arc(x + (i % 2 ? 1 : -1) * radius * 0.2, cy, radius * 0.35, -0.5, 1.2);
            ctx.stroke();
        }
    }

    // Gas bands — Neptune / Uranus
    drawGasBands(x, y, radius, config) {
        const ctx = this.ctx;
        const bandCount = 6;
        for (let i = 0; i < bandCount; i++) {
            const bandY = y - radius + (i + 0.5) * (radius * 2 / bandCount);
            const bandH = radius * 0.08;
            const alpha = 0.08 + (i % 2) * 0.06;
            ctx.fillStyle = (i % 2 === 0)
                ? `rgba(255, 255, 255, ${alpha})`
                : `rgba(0, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.ellipse(x, bandY, radius * 0.95, bandH, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Jupiter — detailed bands with Great Red Spot
    drawJupiterTexture(x, y, radius, config) {
        const ctx = this.ctx;
        // Layered cloud bands
        const bandColors = [
            'rgba(180, 120, 60, 0.2)',
            'rgba(210, 170, 110, 0.15)',
            'rgba(160, 100, 50, 0.2)',
            'rgba(200, 150, 80, 0.12)',
            'rgba(140, 80, 40, 0.18)',
            'rgba(190, 140, 90, 0.15)',
            'rgba(170, 110, 55, 0.2)',
            'rgba(220, 180, 120, 0.1)',
        ];
        for (let i = 0; i < bandColors.length; i++) {
            const bandY = y - radius + (i + 0.5) * (radius * 2 / bandColors.length);
            ctx.fillStyle = bandColors[i];
            ctx.beginPath();
            ctx.ellipse(x, bandY, radius * 0.98, radius * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Great Red Spot
        const spotX = x + radius * 0.25;
        const spotY = y + radius * 0.15;
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, radius * 0.18);
        spotGrad.addColorStop(0, 'rgba(200, 60, 30, 0.6)');
        spotGrad.addColorStop(0.6, 'rgba(180, 50, 20, 0.3)');
        spotGrad.addColorStop(1, 'rgba(180, 50, 20, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, radius * 0.18, radius * 0.12, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Sun/Star — glowing, roiling surface
    drawStarTexture(x, y, radius, config) {
        const ctx = this.ctx;
        const t = this.time * 0.001;
        // Solar plasma patches
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.sin(t + i) * 0.3;
            const dist = radius * 0.3 + Math.sin(t * 1.5 + i * 2) * radius * 0.15;
            const sx = x + Math.cos(angle) * dist;
            const sy = y + Math.sin(angle) * dist;
            const patchGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 0.25);
            patchGrad.addColorStop(0, 'rgba(255, 220, 50, 0.3)');
            patchGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
            ctx.fillStyle = patchGrad;
            ctx.beginPath();
            ctx.arc(sx, sy, radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
        // Bright center
        const centerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.5);
        centerGrad.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
        centerGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Corona glow for Sun
    drawCoronaGlow(x, y, radius) {
        const ctx = this.ctx;
        const t = this.time * 0.001;
        const pulse = 1 + 0.05 * Math.sin(t * 2);
        const coronaGrad = ctx.createRadialGradient(x, y, radius, x, y, radius * 2 * pulse);
        coronaGrad.addColorStop(0, 'rgba(255, 180, 0, 0.15)');
        coronaGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.05)');
        coronaGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2 * pulse, 0, Math.PI * 2);
        ctx.fill();
    }

    // Atmospheric rim lighting
    drawAtmosphericRim(x, y, radius, config) {
        const ctx = this.ctx;
        ctx.strokeStyle = config.glowColor + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
        ctx.stroke();
        // Inner edge shadow
        const rimGrad = ctx.createRadialGradient(x, y, radius * 0.85, x, y, radius);
        rimGrad.addColorStop(0, 'rgba(0,0,0,0)');
        rimGrad.addColorStop(1, config.glowColor + '15');
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Saturn-style rings with Cassini division
    drawDetailedRings(x, y, radius, config) {
        const ctx = this.ctx;
        ctx.save();

        // Draw rings as ellipses behind and in front
        const ringInner = radius * 1.3;
        const ringOuter = radius * 1.9;
        const ringH = 0.25; // Ring ellipse squash

        // Back half (behind planet)
        ctx.globalAlpha = 0.4;
        for (let r = ringInner; r < ringOuter; r += 2) {
            const t = (r - ringInner) / (ringOuter - ringInner);
            const isCassiniGap = t > 0.45 && t < 0.55;
            if (isCassiniGap) continue;
            const alpha = 0.3 + t * 0.3;
            ctx.strokeStyle = `rgba(210, 180, 120, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(x, y, r, r * ringH, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
        }

        // Front half (in front of planet)
        ctx.globalAlpha = 0.6;
        for (let r = ringInner; r < ringOuter; r += 2) {
            const t = (r - ringInner) / (ringOuter - ringInner);
            const isCassiniGap = t > 0.45 && t < 0.55;
            if (isCassiniGap) continue;
            const alpha = 0.4 + t * 0.3;
            ctx.strokeStyle = `rgba(210, 180, 120, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(x, y, r, r * ringH, 0, 0, Math.PI);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // Draw event horizon danger line
    drawEventHorizon(y) {
        const ctx = this.ctx;
        ctx.save();

        // Dashed line with pulse
        const pulse = 0.4 + 0.3 * Math.sin(this.time * 0.003);
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#ff3232';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(12, y);
        ctx.lineTo(this.canvas.width - 12, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Warning text
        ctx.globalAlpha = pulse * 0.5;
        ctx.fillStyle = '#ff3232';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ EVENT HORIZON ⚠', this.canvas.width / 2, y - 5);

        ctx.restore();
    }

    // Draw premium 3D glass container
    draw3DContainer() {
        const ctx = this.ctx;
        const wallW = 12;
        const top = 110;
        const h = this.canvas.height - top - 60; // Leave 60px for hierarchy chart
        const w = this.canvas.width;

        ctx.save();

        // Left wall with depth gradient
        const lgr = ctx.createLinearGradient(0, 0, wallW + 8, 0);
        lgr.addColorStop(0, 'rgba(20, 10, 50, 0.95)');
        lgr.addColorStop(0.5, 'rgba(40, 20, 80, 0.7)');
        lgr.addColorStop(1, 'rgba(40, 20, 80, 0)');
        ctx.fillStyle = lgr;
        ctx.fillRect(0, top, wallW + 8, h);

        // Right wall with depth gradient
        const rgr = ctx.createLinearGradient(w, 0, w - wallW - 8, 0);
        rgr.addColorStop(0, 'rgba(20, 10, 50, 0.95)');
        rgr.addColorStop(0.5, 'rgba(40, 20, 80, 0.7)');
        rgr.addColorStop(1, 'rgba(40, 20, 80, 0)');
        ctx.fillStyle = rgr;
        ctx.fillRect(w - wallW - 8, top, wallW + 8, h);

        // Bottom wall
        const bgr = ctx.createLinearGradient(0, top + h, 0, top + h - wallW - 8);
        bgr.addColorStop(0, 'rgba(20, 10, 50, 0.95)');
        bgr.addColorStop(0.5, 'rgba(40, 20, 80, 0.7)');
        bgr.addColorStop(1, 'rgba(40, 20, 80, 0)');
        ctx.fillStyle = bgr;
        ctx.fillRect(0, top + h - wallW, w, wallW + 8);

        // Edge highlights
        ctx.strokeStyle = 'rgba(120, 80, 200, 0.3)';
        ctx.lineWidth = 1;
        // Left edge
        ctx.beginPath();
        ctx.moveTo(wallW, top);
        ctx.lineTo(wallW, top + h);
        ctx.stroke();
        // Right edge
        ctx.beginPath();
        ctx.moveTo(w - wallW, top);
        ctx.lineTo(w - wallW, top + h);
        ctx.stroke();
        // Bottom edge
        ctx.beginPath();
        ctx.moveTo(wallW, top + h - 2);
        ctx.lineTo(w - wallW, top + h - 2);
        ctx.stroke();

        // Top inner shadow
        const tShadow = ctx.createLinearGradient(0, top, 0, top + 30);
        tShadow.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        tShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = tShadow;
        ctx.fillRect(wallW, top, w - wallW * 2, 30);

        ctx.restore();
    }

    // Utility: Lighten a hex color
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // Utility: Darken a hex color
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

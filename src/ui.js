/**
 * Premium UI System for Pandu
 * Glassmorphism panels, hierarchy chart, polished visual effects
 * Uses Renderer's shared drawPlanetAt() for consistent planet rendering
 */

import { getPlanetById, PLANETS } from './planets.js';

export class UI {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.renderer = renderer; // Shared renderer for consistent planet drawing
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameOver = false;
        this.scoreFlashTimer = 0;
        this.lastScoreAdd = 0;
    }

    /**
     * Draw current planet preview at drop position — uses shared renderer
     */
    drawCurrentPlanetIndicator(x, y, planetId) {
        const config = getPlanetById(planetId);
        if (!config) return;

        this.ctx.save();

        // Drop guide line — subtle dotted vertical
        this.ctx.globalAlpha = 0.15;
        this.ctx.strokeStyle = config.glowColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 6]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + config.radius + 5);
        this.ctx.lineTo(x, this.canvas.height - 75); // Stop above hierarchy
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1.0;

        // Use shared planet renderer
        this.renderer.drawPlanetAt(x, y, config.radius, planetId);

        this.ctx.restore();
    }

    /**
     * Draw premium score panel with glassmorphism
     */
    drawScore() {
        const boxX = 15;
        const boxY = 15;
        const boxW = 115;
        const boxH = 95;

        this.ctx.save();

        // Glass background
        this.drawGlassPanel(boxX, boxY, boxW, boxH);

        // "SCORE" label
        this.ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('S C O R E', boxX + 12, boxY + 22);

        // Score value
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 24px monospace';
        this.ctx.fillText('' + this.score, boxX + 12, boxY + 52);

        // Score flash effect
        if (this.scoreFlashTimer > 0) {
            this.ctx.globalAlpha = this.scoreFlashTimer;
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText('+' + this.lastScoreAdd, boxX + boxW - 40, boxY + 52);
            this.scoreFlashTimer -= 0.02;
            this.ctx.globalAlpha = 1;
        }

        // High score
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText('BEST  ' + this.highScore, boxX + 12, boxY + 78);

        this.ctx.restore();
    }

    /**
     * Draw premium next planet preview — uses shared renderer
     */
    drawNextPlanetPreview(nextPlanetId) {
        const config = getPlanetById(nextPlanetId);
        if (!config) return;

        const boxX = this.canvas.width - 130;
        const boxY = 15;
        const boxW = 115;
        const boxH = 95;

        this.ctx.save();

        // Glass background
        this.drawGlassPanel(boxX, boxY, boxW, boxH);

        // "NEXT" label
        this.ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('NEXT', boxX + boxW / 2, boxY + 20);

        // Mini planet using shared renderer (capped display size)
        const centerX = boxX + boxW / 2;
        const centerY = boxY + boxH / 2 + 5;
        const displayRadius = Math.min(22, config.radius);
        this.renderer.drawPlanetAt(centerX, centerY, displayRadius, nextPlanetId);

        // Planet name
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '9px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(config.name, centerX, boxY + boxH - 8);

        this.ctx.restore();
    }

    /**
     * Draw horizontal hierarchy chart at bottom
     * Shows all 9 planets in merge order with arrows
     */
    drawHierarchyChart() {
        const ctx = this.ctx;
        ctx.save();

        const chartH = 55;
        const chartY = this.canvas.height - chartH;
        const w = this.canvas.width;
        const planetCount = PLANETS.length;

        // Semi-transparent background
        ctx.fillStyle = 'rgba(5, 2, 15, 0.7)';
        ctx.fillRect(0, chartY, w, chartH);

        // Top border line
        const borderGrad = ctx.createLinearGradient(0, 0, w, 0);
        borderGrad.addColorStop(0, 'rgba(120, 80, 200, 0)');
        borderGrad.addColorStop(0.3, 'rgba(120, 80, 200, 0.3)');
        borderGrad.addColorStop(0.7, 'rgba(120, 80, 200, 0.3)');
        borderGrad.addColorStop(1, 'rgba(120, 80, 200, 0)');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, chartY);
        ctx.lineTo(w, chartY);
        ctx.stroke();

        // Layout: evenly space planets across the width
        const padding = 16;
        const usableW = w - padding * 2;
        const spacing = usableW / (planetCount - 1);
        const iconY = chartY + chartH / 2 - 2;
        const maxIconR = 10;

        for (let i = 0; i < planetCount; i++) {
            const planet = PLANETS[i];
            const px = padding + i * spacing;

            // Scale icon radius (larger planets get slightly bigger icons, but capped)
            const iconR = Math.min(maxIconR, 4 + i * 0.8);

            // Draw mini planet using shared renderer
            this.renderer.drawPlanetAt(px, iconY, iconR, planet.id);

            // Arrow to next planet (except last)
            if (i < planetCount - 1) {
                const nextPx = padding + (i + 1) * spacing;
                const arrowStartX = px + iconR + 2;
                const arrowEndX = nextPx - (Math.min(maxIconR, 4 + (i + 1) * 0.8)) - 2;

                if (arrowEndX - arrowStartX > 4) {
                    ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(arrowStartX, iconY);
                    ctx.lineTo(arrowEndX, iconY);
                    ctx.stroke();

                    // Arrow head
                    ctx.fillStyle = 'rgba(167, 139, 250, 0.3)';
                    ctx.beginPath();
                    ctx.moveTo(arrowEndX, iconY);
                    ctx.lineTo(arrowEndX - 3, iconY - 2);
                    ctx.lineTo(arrowEndX - 3, iconY + 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    }

    /**
     * Draw glassmorphism panel
     */
    drawGlassPanel(x, y, w, h) {
        // Background blur simulation
        this.ctx.fillStyle = 'rgba(10, 5, 25, 0.65)';
        this.roundRect(x, y, w, h, 10);
        this.ctx.fill();

        // Glass border
        const borderGrad = this.ctx.createLinearGradient(x, y, x + w, y + h);
        borderGrad.addColorStop(0, 'rgba(167, 139, 250, 0.3)');
        borderGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.08)');
        borderGrad.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
        this.ctx.strokeStyle = borderGrad;
        this.ctx.lineWidth = 1;
        this.roundRect(x, y, w, h, 10);
        this.ctx.stroke();

        // Top highlight reflection
        this.ctx.save();
        this.ctx.beginPath();
        this.roundRect(x, y, w, h, 10);
        this.ctx.clip();
        const highlightGrad = this.ctx.createLinearGradient(x, y, x, y + h * 0.4);
        highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
        highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = highlightGrad;
        this.ctx.fillRect(x, y, w, h * 0.4);
        this.ctx.restore();
    }

    /**
     * Draw rounded rectangle path
     */
    roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }

    /**
     * Draw premium game over overlay
     */
    drawGameOver() {
        this.ctx.save();

        // Full screen overlay with gradient
        const overlayGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        overlayGrad.addColorStop(0, 'rgba(5, 0, 15, 0.85)');
        overlayGrad.addColorStop(0.5, 'rgba(10, 0, 25, 0.8)');
        overlayGrad.addColorStop(1, 'rgba(5, 0, 15, 0.85)');
        this.ctx.fillStyle = overlayGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // Glass card
        const cardW = 340;
        const cardH = 280;
        const cardX = cx - cardW / 2;
        const cardY = cy - cardH / 2;
        this.drawGlassPanel(cardX, cardY, cardW, cardH);

        // Title
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ec4899';
        this.ctx.font = 'bold 32px monospace';
        this.ctx.fillText('GAME OVER', cx, cardY + 60);

        // Decorative line
        const lineGrad = this.ctx.createLinearGradient(cx - 80, 0, cx + 80, 0);
        lineGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
        lineGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.5)');
        lineGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        this.ctx.strokeStyle = lineGrad;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 80, cardY + 75);
        this.ctx.lineTo(cx + 80, cardY + 75);
        this.ctx.stroke();

        // Final score
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText('FINAL SCORE', cx, cardY + 110);

        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 38px monospace';
        this.ctx.fillText(this.formatScore(this.score), cx, cardY + 155);

        // High score celebration or display
        if (this.score >= this.highScore && this.score > 0) {
            this.ctx.fillStyle = '#a78bfa';
            this.ctx.font = 'bold 14px monospace';
            this.ctx.fillText('★ NEW HIGH SCORE ★', cx, cardY + 195);
        } else {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText('Best: ' + this.formatScore(this.highScore), cx, cardY + 195);
        }

        // Restart prompt
        this.ctx.fillStyle = 'rgba(167, 139, 250, 0.7)';
        this.ctx.font = '13px sans-serif';
        this.ctx.fillText('Tap anywhere to restart', cx, cardY + 245);

        this.ctx.restore();
    }

    formatScore(score) {
        return score.toLocaleString();
    }

    addScore(points) {
        this.score += points;
        this.lastScoreAdd = points;
        this.scoreFlashTimer = 1.0;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    resetScore() {
        this.score = 0;
        this.gameOver = false;
        this.scoreFlashTimer = 0;
    }

    setGameOver(isGameOver) {
        this.gameOver = isGameOver;
    }

    getScore() {
        return this.score;
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('pandu_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('pandu_highscore', this.highScore.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }
}

/**
 * UI components for Pandu
 * Handles score display, next planet preview, and game over screen
 */

import { getPlanetById } from './planets.js';

export class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameOver = false;
    }

    /**
     * Draw current planet indicator at drop position
     */
    drawCurrentPlanetIndicator(x, y, planetId) {
        const config = getPlanetById(planetId);
        if (!config) return;

        this.ctx.save();
        this.ctx.globalAlpha = 0.6;

        // Draw ghost planet
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, config.radius);
        gradient.addColorStop(0, config.color + '80');
        gradient.addColorStop(1, config.color + '20');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, config.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw outline
        this.ctx.strokeStyle = config.glowColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Draw next planet preview window
     */
    drawNextPlanetPreview(nextPlanetId) {
        const config = getPlanetById(nextPlanetId);
        if (!config) return;

        const boxX = this.canvas.width - 120;
        const boxY = 20;
        const boxWidth = 100;
        const boxHeight = 100;

        this.ctx.save();

        // Draw box background
        this.ctx.fillStyle = 'rgba(20, 0, 40, 0.8)';
        this.ctx.strokeStyle = '#8B00FF';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw "NEXT" label
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('NEXT', boxX + boxWidth / 2, boxY + 15);

        // Draw mini planet
        const centerX = boxX + boxWidth / 2;
        const centerY = boxY + boxHeight / 2 + 10;
        const scale = Math.min(30 / config.radius, 1);
        const displayRadius = config.radius * scale;

        // Glow
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, displayRadius * 0.5,
            centerX, centerY, displayRadius * 1.5
        );
        gradient.addColorStop(0, config.glowColor + '60');
        gradient.addColorStop(1, config.glowColor + '00');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, displayRadius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Planet
        this.ctx.fillStyle = config.color;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, displayRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Name
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(config.name, centerX, boxY + boxHeight - 10);

        this.ctx.restore();
    }

    /**
     * Draw score display
     */
    drawScore() {
        this.ctx.save();

        // Score box
        this.ctx.fillStyle = 'rgba(20, 0, 40, 0.8)';
        this.ctx.strokeStyle = '#8B00FF';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(20, 20, 150, 80);
        this.ctx.strokeRect(20, 20, 150, 80);

        // Current score
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('SCORE', 30, 45);

        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(this.score.toString(), 30, 75);

        // High score
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.fillText(`Best: ${this.highScore}`, 30, 92);

        this.ctx.restore();
    }

    /**
     * Draw game over screen
     */
    drawGameOver() {
        this.ctx.save();

        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Game over box
        const boxWidth = 400;
        const boxHeight = 300;
        const boxX = (this.canvas.width - boxWidth) / 2;
        const boxY = (this.canvas.height - boxHeight) / 2;

        this.ctx.fillStyle = 'rgba(20, 0, 40, 0.95)';
        this.ctx.strokeStyle = '#FF1493';
        this.ctx.lineWidth = 3;
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Title
        this.ctx.fillStyle = '#FF1493';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, boxY + 80);

        // Score
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, boxY + 140);

        // High score
        if (this.score >= this.highScore) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('🎉 NEW HIGH SCORE! 🎉', this.canvas.width / 2, boxY + 180);
        } else {
            this.ctx.fillStyle = '#AAAAAA';
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, boxY + 180);
        }

        // Restart instruction
        this.ctx.fillStyle = '#8B00FF';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('Click anywhere to restart', this.canvas.width / 2, boxY + 240);

        this.ctx.restore();
    }

    /**
     * Update score
     */
    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    /**
     * Reset score
     */
    resetScore() {
        this.score = 0;
        this.gameOver = false;
    }

    /**
     * Set game over state
     */
    setGameOver(isGameOver) {
        this.gameOver = isGameOver;
    }

    /**
     * Get current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('pandu_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem('pandu_highscore', this.highScore.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }
}

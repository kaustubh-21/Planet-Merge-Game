/**
 * Main game controller for Pandu
 * Coordinates all game systems and manages game state
 */

import { PhysicsEngine } from './physics.js';
import { Renderer } from './renderer.js';
import { ParticleSystem } from './particles.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';
import { AudioSystem } from './audio.js';
import { PLANETS, getPlanetById } from './planets.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        // Game constants
        this.DROP_ZONE_Y = 100;
        this.EVENT_HORIZON_Y = 120;
        this.EVENT_HORIZON_TIMEOUT = 3000; // 3 seconds

        // Initialize systems
        this.physics = new PhysicsEngine(this.width, this.height);
        this.renderer = new Renderer(canvas);
        this.particles = new ParticleSystem();
        this.input = new InputHandler(canvas, this.DROP_ZONE_Y);
        this.ui = new UI(canvas);
        this.audio = new AudioSystem();

        // Game state
        this.currentPlanetId = this.getRandomStartPlanet();
        this.nextPlanetId = this.getRandomStartPlanet();
        this.isGameOver = false;
        this.eventHorizonViolators = new Map();
        this.lastFrameTime = 0;
        this.gameTime = 0;

        // Setup input callback
        this.input.setDropCallback((x) => this.dropPlanet(x));

        // Setup restart on click when game over
        this.canvas.addEventListener('click', () => {
            if (this.isGameOver) {
                this.restart();
            } else {
                // Initialize audio on first click
                this.audio.initialize();
            }
        });

        // Start game loop
        this.running = true;
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Get random starting planet (Moon, Mercury, or Mars)
     */
    getRandomStartPlanet() {
        return Math.floor(Math.random() * 3); // 0, 1, or 2
    }

    /**
     * Drop a planet at the specified x position
     */
    dropPlanet(x) {
        if (this.isGameOver) return;

        // Create planet at drop position
        this.physics.createPlanet(x, this.DROP_ZONE_Y, this.currentPlanetId);

        // Play drop sound
        this.audio.playDropSound();

        // Update current and next planets
        this.currentPlanetId = this.nextPlanetId;
        this.nextPlanetId = this.getRandomStartPlanet();
    }

    /**
     * Check for event horizon violations
     */
    checkEventHorizon() {
        if (this.isGameOver) return;

        const planets = this.physics.getPlanets();
        const now = Date.now();

        for (let planet of planets) {
            const isAboveHorizon = planet.position.y - planet.planetConfig.radius < this.EVENT_HORIZON_Y;

            if (isAboveHorizon) {
                // Track how long planet has been above horizon
                if (!this.eventHorizonViolators.has(planet)) {
                    this.eventHorizonViolators.set(planet, now);
                } else {
                    const violationTime = now - this.eventHorizonViolators.get(planet);
                    if (violationTime > this.EVENT_HORIZON_TIMEOUT) {
                        this.triggerGameOver();
                        return;
                    }
                }
            } else {
                // Planet is below horizon, remove from violators
                this.eventHorizonViolators.delete(planet);
            }
        }
    }

    /**
     * Trigger game over
     */
    triggerGameOver() {
        this.isGameOver = true;
        this.ui.setGameOver(true);
        this.input.setEnabled(false);
        this.audio.playGameOverSound();
    }

    /**
     * Restart game
     */
    restart() {
        // Clear physics
        this.physics.clearPlanets();

        // Reset particles
        this.particles.clear();

        // Reset UI
        this.ui.resetScore();

        // Reset game state
        this.currentPlanetId = this.getRandomStartPlanet();
        this.nextPlanetId = this.getRandomStartPlanet();
        this.isGameOver = false;
        this.eventHorizonViolators.clear();

        // Re-enable input
        this.input.setEnabled(true);
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.running) return;

        // Calculate delta time
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.gameTime = currentTime;

        // Update physics
        const mergeEvents = this.physics.update(deltaTime);

        // Process merge events
        for (let event of mergeEvents) {
            // Create particle effects
            this.particles.createMergeEffect(
                event.x,
                event.y,
                event.oldPlanetId,
                event.newPlanetId
            );

            // Play merge sound
            this.audio.playMergeSound(event.newPlanetId);

            // Trigger haptic feedback
            this.audio.triggerHaptic(event.newPlanetId / 5);

            // Add score
            const planetConfig = getPlanetById(event.newPlanetId);
            if (planetConfig) {
                this.ui.addScore(planetConfig.points);
            }
        }

        // Update particles
        this.particles.update(deltaTime);

        // Check event horizon
        this.checkEventHorizon();

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Render game
     */
    render() {
        const ctx = this.renderer.ctx;
        const shake = this.particles.getScreenShake();

        // Apply screen shake
        ctx.save();
        ctx.translate(shake.x, shake.y);

        // Clear and draw background
        this.renderer.clear();
        this.renderer.renderStarfield(this.gameTime);

        // Draw event horizon
        this.renderer.drawEventHorizon(this.EVENT_HORIZON_Y);

        // Draw all planets
        const planets = this.physics.getPlanets();
        for (let planet of planets) {
            this.renderer.drawPlanet(planet);
        }

        // Draw particles
        this.particles.render(ctx);

        // Draw current planet indicator (if hovering)
        if (this.input.isInDropZone() && !this.isGameOver) {
            this.ui.drawCurrentPlanetIndicator(
                this.input.getCurrentX(),
                this.DROP_ZONE_Y,
                this.currentPlanetId
            );
        }

        ctx.restore();

        // Draw UI (no screen shake)
        this.ui.drawScore();
        this.ui.drawNextPlanetPreview(this.nextPlanetId);

        // Draw game over screen
        if (this.isGameOver) {
            this.ui.drawGameOver();
        }
    }

    /**
     * Stop game loop
     */
    stop() {
        this.running = false;
    }
}

/**
 * Physics engine for Pandu using Matter.js
 * Handles the "Cosmos Jar" container, collision detection, and merge mechanics
 */

import Matter from 'matter-js';
import { getPlanetById, getNextPlanet, canMerge } from './planets.js';

const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const Body = Matter.Body;

export class PhysicsEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Create engine with custom gravity
        this.engine = Engine.create({
            gravity: { x: 0, y: 1.0 }
        });

        this.world = this.engine.world;
        this.planets = [];
        this.mergeQueue = [];

        // Physics constants
        this.RESTITUTION = 0.25; // Low bounce
        this.FRICTION = 0.1;
        this.AIR_RESISTANCE = 0.01;

        this.setupBoundaries();
        this.setupCollisionDetection();
    }

    /**
     * Create the "Cosmos Jar" - rectangular container
     */
    setupBoundaries() {
        const wallThickness = 50;
        const options = {
            isStatic: true,
            restitution: 0.3,
            friction: 0.1
        };

        // Bottom
        this.ground = Bodies.rectangle(
            this.width / 2,
            this.height + wallThickness / 2,
            this.width,
            wallThickness,
            options
        );

        // Left wall
        this.leftWall = Bodies.rectangle(
            -wallThickness / 2,
            this.height / 2,
            wallThickness,
            this.height * 2,
            options
        );

        // Right wall
        this.rightWall = Bodies.rectangle(
            this.width + wallThickness / 2,
            this.height / 2,
            wallThickness,
            this.height * 2,
            options
        );

        World.add(this.world, [this.ground, this.leftWall, this.rightWall]);
    }

    /**
     * Setup collision detection for merge mechanics
     */
    setupCollisionDetection() {
        // Use collisionActive instead of collisionStart for better merge detection
        Events.on(this.engine, 'collisionActive', (event) => {
            const pairs = event.pairs;

            for (let pair of pairs) {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                // Skip if either body is a boundary
                if (bodyA.isStatic || bodyB.isStatic) continue;

                // Skip if either body is already marked for merge
                if (bodyA.markedForMerge || bodyB.markedForMerge) continue;

                // Check if both planets have the same ID and can merge
                if (bodyA.planetId !== undefined &&
                    bodyB.planetId !== undefined &&
                    bodyA.planetId === bodyB.planetId &&
                    canMerge(bodyA.planetId)) {

                    // Mark bodies to prevent duplicate merges
                    bodyA.markedForMerge = true;
                    bodyB.markedForMerge = true;

                    // Queue merge to avoid modifying world during collision event
                    this.mergeQueue.push({ bodyA, bodyB });

                    console.log(`Merge queued: ${bodyA.planetConfig.name} + ${bodyB.planetConfig.name}`);
                }
            }
        });
    }

    /**
     * Create a new planet body
     */
    createPlanet(x, y, planetId) {
        const planetConfig = getPlanetById(planetId);
        if (!planetConfig) return null;

        const planet = Bodies.circle(x, y, planetConfig.radius, {
            restitution: this.RESTITUTION,
            friction: this.FRICTION,
            frictionAir: this.AIR_RESISTANCE,
            density: 0.001
        });

        // Store planet metadata
        planet.planetId = planetId;
        planet.planetConfig = planetConfig;
        planet.spawnTime = Date.now();
        planet.markedForMerge = false;

        World.add(this.world, planet);
        this.planets.push(planet);

        return planet;
    }

    /**
     * Process queued merges
     */
    processMerges() {
        const mergedBodies = new Set();
        const mergeEvents = [];

        for (let merge of this.mergeQueue) {
            const { bodyA, bodyB } = merge;

            // Skip if already merged
            if (mergedBodies.has(bodyA) || mergedBodies.has(bodyB)) continue;

            // Calculate midpoint for new planet spawn
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;

            // Get next planet in chain
            const nextPlanetId = bodyA.planetId + 1;
            const nextPlanetConfig = getPlanetById(nextPlanetId);

            if (nextPlanetConfig) {
                // Remove old planets
                World.remove(this.world, bodyA);
                World.remove(this.world, bodyB);
                this.planets = this.planets.filter(p => p !== bodyA && p !== bodyB);

                // Create new merged planet
                const newPlanet = this.createPlanet(midX, midY, nextPlanetId);

                // Mark as merged
                mergedBodies.add(bodyA);
                mergedBodies.add(bodyB);

                // Store merge event for visual effects
                mergeEvents.push({
                    x: midX,
                    y: midY,
                    oldPlanetId: bodyA.planetId,
                    newPlanetId: nextPlanetId,
                    newPlanet: newPlanet
                });

                console.log(`Merged: ${bodyA.planetConfig.name} -> ${nextPlanetConfig.name}`);
            }
        }

        // Clear merge queue
        this.mergeQueue = [];

        return mergeEvents;
    }

    /**
     * Update physics simulation
     */
    update(delta = 16.67) {
        Engine.update(this.engine, delta);
        return this.processMerges();
    }

    /**
     * Get all planet bodies
     */
    getPlanets() {
        return this.planets;
    }

    /**
     * Remove a planet from the world
     */
    removePlanet(planet) {
        World.remove(this.world, planet);
        this.planets = this.planets.filter(p => p !== planet);
    }

    /**
     * Clear all planets
     */
    clearPlanets() {
        for (let planet of this.planets) {
            World.remove(this.world, planet);
        }
        this.planets = [];
    }
}

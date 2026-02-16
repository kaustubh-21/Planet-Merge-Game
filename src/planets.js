/**
 * Planet configuration for Pandu
 * Each planet has a unique ID, visual properties, and physics parameters
 * Radius follows 1.3x multiplier progression
 */

const BASE_RADIUS = 20; // Starting radius for Moon
const RADIUS_MULTIPLIER = 1.3;

export const PLANETS = [
    {
        id: 0,
        name: 'Moon',
        radius: BASE_RADIUS,
        color: '#C0C0C0',
        glowColor: '#E8E8E8',
        points: 1,
        texture: 'crater'
    },
    {
        id: 1,
        name: 'Mercury',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 1),
        color: '#8C7853',
        glowColor: '#B8A080',
        points: 3,
        texture: 'rocky'
    },
    {
        id: 2,
        name: 'Mars',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 2),
        color: '#CD5C5C',
        glowColor: '#FF6B6B',
        points: 6,
        texture: 'dusty'
    },
    {
        id: 3,
        name: 'Earth',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 3),
        color: '#4169E1',
        glowColor: '#6495ED',
        points: 10,
        texture: 'earth'
    },
    {
        id: 4,
        name: 'Neptune',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 4),
        color: '#4682B4',
        glowColor: '#87CEEB',
        points: 15,
        texture: 'gas'
    },
    {
        id: 5,
        name: 'Saturn',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 5),
        color: '#DAA520',
        glowColor: '#FFD700',
        points: 21,
        texture: 'ringed',
        hasRings: true
    },
    {
        id: 6,
        name: 'Jupiter',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 6),
        color: '#D2691E',
        glowColor: '#FF8C42',
        points: 28,
        texture: 'gas-giant'
    },
    {
        id: 7,
        name: 'Sun',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 7),
        color: '#FFA500',
        glowColor: '#FFD700',
        points: 36,
        texture: 'star',
        isLuminous: true
    },
    {
        id: 8,
        name: 'Sirius',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 8),
        color: '#00BFFF',
        glowColor: '#87CEFA',
        points: 45,
        texture: 'blue-star',
        isLuminous: true
    },
    {
        id: 9,
        name: 'Black Hole',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 9),
        color: '#1a0033',
        glowColor: '#8B00FF',
        points: 55,
        texture: 'black-hole',
        hasAccretionDisk: true
    },
    {
        id: 10,
        name: 'Supernova',
        radius: BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 10),
        color: '#FF1493',
        glowColor: '#FF69B4',
        points: 100,
        texture: 'supernova',
        isExplosive: true
    }
];

/**
 * Get planet configuration by ID
 */
export function getPlanetById(id) {
    return PLANETS[id] || null;
}

/**
 * Get next planet in merge chain
 */
export function getNextPlanet(currentId) {
    if (currentId >= PLANETS.length - 1) return null;
    return PLANETS[currentId + 1];
}

/**
 * Check if planet can merge (not final stage)
 */
export function canMerge(planetId) {
    return planetId < PLANETS.length - 1;
}

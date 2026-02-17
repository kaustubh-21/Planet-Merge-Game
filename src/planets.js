/**
 * Planet configuration for Pandu
 * 9 planets in merge order: Mercury → Mars → Venus → Earth → Neptune → Uranus → Saturn → Jupiter → Sun
 * Base radius 16px with 1.25x multiplier per tier
 * Sun + Jupiter diameters fit within the 450px container width
 */

const BASE_RADIUS = 16;
const RADIUS_MULTIPLIER = 1.25;

export const PLANETS = [
    {
        id: 0,
        name: 'Mercury',
        radius: BASE_RADIUS,
        color: '#8C7853',
        glowColor: '#B8A080',
        points: 2,
        texture: 'rocky'
    },
    {
        id: 1,
        name: 'Mars',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 1)),
        color: '#CD5C5C',
        glowColor: '#FF6B6B',
        points: 4,
        texture: 'dusty'
    },
    {
        id: 2,
        name: 'Venus',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 2)),
        color: '#E8B960',
        glowColor: '#FFD280',
        points: 8,
        texture: 'venus'
    },
    {
        id: 3,
        name: 'Earth',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 3)),
        color: '#4169E1',
        glowColor: '#6495ED',
        points: 15,
        texture: 'earth'
    },
    {
        id: 4,
        name: 'Neptune',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 4)),
        color: '#4682B4',
        glowColor: '#87CEEB',
        points: 25,
        texture: 'gas'
    },
    {
        id: 5,
        name: 'Uranus',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 5)),
        color: '#5FCED8',
        glowColor: '#A0E8F0',
        points: 40,
        texture: 'gas'
    },
    {
        id: 6,
        name: 'Saturn',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 6)),
        color: '#DAA520',
        glowColor: '#FFD700',
        points: 60,
        texture: 'gas',
        hasRings: true
    },
    {
        id: 7,
        name: 'Jupiter',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 7)),
        color: '#D2691E',
        glowColor: '#FF8C42',
        points: 85,
        texture: 'gas-giant'
    },
    {
        id: 8,
        name: 'Sun',
        radius: Math.round(BASE_RADIUS * Math.pow(RADIUS_MULTIPLIER, 8)),
        color: '#FFA500',
        glowColor: '#FFD700',
        points: 120,
        texture: 'star',
        isLuminous: true,
        isFinal: true
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

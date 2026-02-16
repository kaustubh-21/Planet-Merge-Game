/**
 * Main entry point for Pandu
 */

import { Game } from './src/game.js';

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const loading = document.getElementById('loading');

    // Initialize game
    try {
        const game = new Game(canvas);

        // Hide loading screen
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 500);

        console.log('🌌 Pandu initialized successfully!');
        console.log('🎮 Click to drop planets and merge them!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        loading.innerHTML = '<h1>Error</h1><p>Failed to load game. Please refresh.</p>';
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Could implement dynamic canvas resizing here if needed
});

// Register service worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but game still works
        });
    });
}

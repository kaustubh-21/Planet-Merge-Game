/**
 * Input handler for mouse and touch controls
 * Handles horizontal positioning and drop mechanics
 * Now supports drag-anywhere functionality
 */

export class InputHandler {
    constructor(canvas, dropZoneY) {
        this.canvas = canvas;
        this.dropZoneY = dropZoneY;
        this.currentX = canvas.width / 2;
        this.isHovering = false;
        this.isDragging = false;
        this.enabled = true;

        this.setupEventListeners();
    }

    /**
     * Setup unified mouse and touch event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('mouseleave', () => this.handleLeave());

        // Touch events
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        }, { passive: false });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e);
        }, { passive: false });
    }

    /**
     * Handle move events (mouse/touch) - now works anywhere on canvas
     */
    handleMove(e) {
        if (!this.enabled) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Always track horizontal position anywhere on canvas
        this.isHovering = true;
        this.currentX = Math.max(50, Math.min(this.canvas.width - 50, x));
    }

    /**
     * Handle start events (mousedown/touchstart) - works anywhere
     */
    handleStart(e) {
        if (!this.enabled) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Start dragging from anywhere on canvas
        this.isDragging = true;
        this.isHovering = true;
        this.currentX = Math.max(50, Math.min(this.canvas.width - 50, x));
    }

    /**
     * Handle end events (mouseup/touchend)
     */
    handleEnd(e) {
        if (!this.enabled || !this.isDragging) return;

        this.isDragging = false;

        // Trigger drop callback
        if (this.onDrop && this.isHovering) {
            this.onDrop(this.currentX);
        }
    }

    /**
     * Handle mouse leave
     */
    handleLeave() {
        this.isHovering = false;
        this.isDragging = false;
    }

    /**
     * Set drop callback
     */
    setDropCallback(callback) {
        this.onDrop = callback;
    }

    /**
     * Get current position
     */
    getCurrentX() {
        return this.currentX;
    }

    /**
     * Check if hovering in drop zone
     */
    isInDropZone() {
        return this.isHovering;
    }

    /**
     * Enable/disable input
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.isHovering = false;
            this.isDragging = false;
        }
    }
}

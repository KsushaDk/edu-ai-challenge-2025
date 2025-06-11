/**
 * Represents a ship in the Sea Battle game
 * Manages ship placement, hit detection, and sinking status
 */
class Ship {
    constructor(shipLength) {
        this._validateShipLength(shipLength);

        this.length = shipLength;
        this.occupiedLocations = [];
        this.hitMarkers = [];
        this.isPlaced = false;
    }

    /**
     * Validate ship length parameter
     * @param {number} length - The length to validate
     * @private
     */
    _validateShipLength(length) {
        if (!Number.isInteger(length) || length < 1) {
            throw new Error('Ship length must be a positive integer');
        }
    }

    /**
     * Place the ship at specified locations
     * @param {string[]} locationCoordinates - Array of location strings (e.g., ["00", "01", "02"])
     * @throws {Error} If locations array length doesn't match ship length or ship is already placed
     */
    placeAtLocations(locationCoordinates) {
        this._validatePlacement(locationCoordinates);

        this.occupiedLocations = [...locationCoordinates];
        this.hitMarkers = new Array(this.length).fill(false);
        this.isPlaced = true;
    }

    /**
     * Validate ship placement parameters
     * @param {string[]} locations - Array of location strings
     * @private
     */
    _validatePlacement(locations) {
        if (this.isPlaced) {
            throw new Error('Ship has already been placed');
        }

        if (!Array.isArray(locations)) {
            throw new Error('Locations must be provided as an array');
        }

        if (locations.length !== this.length) {
            throw new Error(
                `Ship requires exactly ${this.length} locations, but ${locations.length} were provided`
            );
        }
    }

    /**
     * Attempt to hit the ship at a specific location
     * @param {string} targetLocation - Location string (e.g., "00")
     * @returns {boolean} - True if hit was successful, false if already hit or invalid location
     */
    receiveAttackAt(targetLocation) {
        const locationIndex = this._findLocationIndex(targetLocation);

        if (locationIndex === -1) {
            return false; // Location not part of this ship
        }

        if (this.hitMarkers[locationIndex]) {
            return false; // Already hit at this location
        }

        this.hitMarkers[locationIndex] = true;
        return true;
    }

    /**
     * Check if the ship is completely destroyed
     * @returns {boolean} - True if all parts of the ship are hit
     */
    isCompletelyDestroyed() {
        if (!this.isPlaced) {
            return false;
        }
        return this.hitMarkers.every(isHit => isHit === true);
    }

    /**
     * Check if a location is occupied by this ship
     * @param {string} queryLocation - Location string to check
     * @returns {boolean} - True if location is occupied by this ship
     */
    occupiesLocation(queryLocation) {
        return this.occupiedLocations.includes(queryLocation);
    }

    /**
     * Check if a specific location on this ship has been hit
     * @param {string} queryLocation - Location string to check
     * @returns {boolean} - True if the location is hit on this ship
     */
    isLocationDamaged(queryLocation) {
        const locationIndex = this._findLocationIndex(queryLocation);
        return locationIndex !== -1 && this.hitMarkers[locationIndex];
    }

    /**
     * Get the current damage status of the ship
     * @returns {Object} - Object containing damage information
     */
    getDamageReport() {
        const totalHits = this.hitMarkers.filter(isHit => isHit).length;
        const damagePercentage = this.isPlaced ? Math.round((totalHits / this.length) * 100) : 0;

        return {
            totalHits,
            totalLength: this.length,
            damagePercentage,
            isDestroyed: this.isCompletelyDestroyed(),
            isPlaced: this.isPlaced,
        };
    }

    /**
     * Find the index of a location in the ship's occupied locations
     * @param {string} location - Location string to find
     * @returns {number} - Index of location, or -1 if not found
     * @private
     */
    _findLocationIndex(location) {
        return this.occupiedLocations.indexOf(location);
    }
}

module.exports = Ship;

const Ship = require('./Ship.js');

/**
 * Represents a game board in the Sea Battle game
 * Manages grid state, ship placement, and attack processing
 */
class GameBoard {
    constructor(boardSize = 10) {
        this._validateBoardSize(boardSize);

        this.boardDimensions = boardSize;
        this.gameGrid = this._initializeEmptyGrid();
        this.deployedShips = [];
        this.recordedAttacks = [];
    }

    /**
     * Validate board size parameter
     * @param {number} size - The board size to validate
     * @private
     */
    _validateBoardSize(size) {
        if (!Number.isInteger(size) || size < 5 || size > 20) {
            throw new Error('Board size must be an integer between 5 and 20');
        }
    }

    /**
     * Initialize an empty grid filled with water symbols
     * @returns {string[][]} - 2D array representing the board with water symbols
     * @private
     */
    _initializeEmptyGrid() {
        return Array.from({ length: this.boardDimensions }, () =>
            Array.from({ length: this.boardDimensions }, () => '~')
        );
    }

    /**
     * Attempt to place a ship randomly on the board
     * @param {number} shipLength - Length of the ship to place
     * @returns {boolean} - True if ship was placed successfully, false otherwise
     */
    attemptRandomShipPlacement(shipLength) {
        const maxPlacementAttempts = 100;
        let currentAttempt = 0;

        while (currentAttempt < maxPlacementAttempts) {
            const shipOrientation = this._selectRandomOrientation();
            const proposedLocations = this._generateShipLocationCandidates(
                shipLength,
                shipOrientation
            );

            if (proposedLocations && this._canPlaceShipAtLocations(proposedLocations)) {
                const newShip = new Ship(shipLength);
                newShip.placeAtLocations(proposedLocations);
                this.deployedShips.push(newShip);
                this._markShipPresenceOnGrid(proposedLocations);
                return true;
            }

            currentAttempt++;
        }

        return false;
    }

    /**
     * Select a random orientation for ship placement
     * @returns {string} - Either 'horizontal' or 'vertical'
     * @private
     */
    _selectRandomOrientation() {
        return Math.random() < 0.5 ? 'horizontal' : 'vertical';
    }

    /**
     * Generate potential location coordinates for a ship
     * @param {number} shipLength - Length of the ship
     * @param {string} orientation - 'horizontal' or 'vertical'
     * @returns {string[]|null} - Array of location coordinate strings or null if invalid
     * @private
     */
    _generateShipLocationCandidates(shipLength, orientation) {
        const startingCoordinates = this._selectRandomStartingPosition(shipLength, orientation);

        if (!startingCoordinates) {
            return null;
        }

        const { startRow, startColumn } = startingCoordinates;
        const locationCoordinates = [];

        for (let segmentIndex = 0; segmentIndex < shipLength; segmentIndex++) {
            const coordinateRow = orientation === 'horizontal' ? startRow : startRow + segmentIndex;
            const coordinateColumn =
                orientation === 'horizontal' ? startColumn + segmentIndex : startColumn;

            if (this._isCoordinateOutOfBounds(coordinateRow, coordinateColumn)) {
                return null;
            }

            locationCoordinates.push(`${coordinateRow}${coordinateColumn}`);
        }

        return locationCoordinates;
    }

    /**
     * Select a random valid starting position for ship placement
     * @param {number} shipLength - Length of the ship
     * @param {string} orientation - 'horizontal' or 'vertical'
     * @returns {Object|null} - Object with startRow and startColumn, or null if invalid
     * @private
     */
    _selectRandomStartingPosition(shipLength, orientation) {
        let startRow, startColumn;

        if (orientation === 'horizontal') {
            startRow = Math.floor(Math.random() * this.boardDimensions);
            startColumn = Math.floor(Math.random() * (this.boardDimensions - shipLength + 1));
        } else {
            startRow = Math.floor(Math.random() * (this.boardDimensions - shipLength + 1));
            startColumn = Math.floor(Math.random() * this.boardDimensions);
        }

        return { startRow, startColumn };
    }

    /**
     * Check if coordinates are outside the board boundaries
     * @param {number} row - Row coordinate
     * @param {number} column - Column coordinate
     * @returns {boolean} - True if coordinates are out of bounds
     * @private
     */
    _isCoordinateOutOfBounds(row, column) {
        return (
            row >= this.boardDimensions || column >= this.boardDimensions || row < 0 || column < 0
        );
    }

    /**
     * Check if a ship can be placed at the specified locations
     * @param {string[]} proposedLocations - Array of location coordinate strings
     * @returns {boolean} - True if all locations are available for ship placement
     * @private
     */
    _canPlaceShipAtLocations(proposedLocations) {
        return proposedLocations.every(locationCoordinate => {
            const { row, column } = this._parseLocationCoordinate(locationCoordinate);
            return this.gameGrid[row][column] === '~';
        });
    }

    /**
     * Mark ship presence on the grid at specified locations
     * @param {string[]} shipLocations - Array of location coordinate strings
     * @private
     */
    _markShipPresenceOnGrid(shipLocations) {
        shipLocations.forEach(locationCoordinate => {
            const { row, column } = this._parseLocationCoordinate(locationCoordinate);
            this.gameGrid[row][column] = 'S';
        });
    }

    /**
     * Process an incoming attack at a specific location
     * @param {string} targetLocation - Location coordinate string (e.g., "00")
     * @returns {Object} - Attack result object with hit status and ship destruction status
     */
    processIncomingAttack(targetLocation) {
        if (this._hasLocationBeenAttacked(targetLocation)) {
            return this._createAttackResult(
                'already_attacked',
                false,
                false,
                'You already attacked that location!'
            );
        }

        this._recordAttack(targetLocation);
        const { row, column } = this._parseLocationCoordinate(targetLocation);

        // Find if any ship occupies the target location
        const targetedShip = this._findShipAtLocation(targetLocation);

        if (targetedShip && targetedShip.receiveAttackAt(targetLocation)) {
            this.gameGrid[row][column] = 'X';
            const isDestroyed = targetedShip.isCompletelyDestroyed();

            return this._createAttackResult(
                'hit',
                true,
                isDestroyed,
                isDestroyed ? 'You sunk a battleship!' : 'HIT!'
            );
        } else if (targetedShip && targetedShip.isLocationDamaged(targetLocation)) {
            return this._createAttackResult(
                'already_hit',
                true,
                false,
                'You already hit that spot!'
            );
        } else {
            this.gameGrid[row][column] = 'O';
            return this._createAttackResult('miss', false, false, 'MISS.');
        }
    }

    /**
     * Check if a location has already been attacked
     * @param {string} location - Location coordinate string
     * @returns {boolean} - True if location was previously attacked
     * @private
     */
    _hasLocationBeenAttacked(location) {
        return this.recordedAttacks.includes(location);
    }

    /**
     * Record an attack at the specified location
     * @param {string} location - Location coordinate string
     * @private
     */
    _recordAttack(location) {
        this.recordedAttacks.push(location);
    }

    /**
     * Find a ship that occupies the specified location
     * @param {string} location - Location coordinate string
     * @returns {Ship|undefined} - Ship object if found, undefined otherwise
     * @private
     */
    _findShipAtLocation(location) {
        return this.deployedShips.find(ship => ship.occupiesLocation(location));
    }

    /**
     * Create a standardized attack result object
     * @param {string} status - Attack status
     * @param {boolean} isHit - Whether the attack was a hit
     * @param {boolean} isShipDestroyed - Whether a ship was destroyed
     * @param {string} message - Result message
     * @returns {Object} - Attack result object
     * @private
     */
    _createAttackResult(status, isHit, isShipDestroyed, message) {
        return {
            status,
            hit: isHit,
            sunk: isShipDestroyed,
            message,
        };
    }

    /**
     * Get the number of ships that are still operational
     * @returns {number} - Number of ships that are not completely destroyed
     */
    getOperationalShipsCount() {
        return this.deployedShips.filter(ship => !ship.isCompletelyDestroyed()).length;
    }

    /**
     * Check if all ships on the board have been completely destroyed
     * @returns {boolean} - True if all ships are destroyed
     */
    areAllShipsDestroyed() {
        return this.deployedShips.every(ship => ship.isCompletelyDestroyed());
    }

    /**
     * Parse a location coordinate string into row and column numbers
     * @param {string} locationCoordinate - Location coordinate string (e.g., "00")
     * @returns {Object} - Object with row and column properties
     * @private
     */
    _parseLocationCoordinate(locationCoordinate) {
        return {
            row: parseInt(locationCoordinate[0], 10),
            column: parseInt(locationCoordinate[1], 10),
        };
    }

    /**
     * Get the grid for display purposes
     * @param {boolean} shouldRevealShips - Whether to show ship locations
     * @returns {string[][]} - 2D array of the current board state for display
     */
    getDisplayGrid(shouldRevealShips = false) {
        if (shouldRevealShips) {
            return this.gameGrid.map(row => [...row]);
        }

        // Hide ships for opponent view - show only water and attack results
        return this.gameGrid.map(row => row.map(cell => (cell === 'S' ? '~' : cell)));
    }

    /**
     * Validate if a location coordinate string has proper format and is within bounds
     * @param {string} locationCoordinate - Location coordinate string to validate
     * @returns {boolean} - True if the location coordinate is valid
     */
    isValidLocationCoordinate(locationCoordinate) {
        if (!locationCoordinate || locationCoordinate.length !== 2) {
            return false;
        }

        const { row, column } = this._parseLocationCoordinate(locationCoordinate);

        return (
            !isNaN(row) &&
            !isNaN(column) &&
            row >= 0 &&
            row < this.boardDimensions &&
            column >= 0 &&
            column < this.boardDimensions
        );
    }

    /**
     * Get comprehensive board statistics
     * @returns {Object} - Object containing board statistics
     */
    getBoardStatistics() {
        const totalShips = this.deployedShips.length;
        const destroyedShips = this.deployedShips.filter(ship =>
            ship.isCompletelyDestroyed()
        ).length;
        const totalAttacks = this.recordedAttacks.length;
        const successfulHits = this._countSuccessfulHits();

        return {
            totalShips,
            operationalShips: totalShips - destroyedShips,
            destroyedShips,
            totalAttacks,
            successfulHits,
            missedAttacks: totalAttacks - successfulHits,
            hitAccuracy: totalAttacks > 0 ? Math.round((successfulHits / totalAttacks) * 100) : 0,
        };
    }

    /**
     * Count the number of successful hits on the board
     * @returns {number} - Number of successful hits
     * @private
     */
    _countSuccessfulHits() {
        let hitCount = 0;

        for (let row = 0; row < this.boardDimensions; row++) {
            for (let column = 0; column < this.boardDimensions; column++) {
                if (this.gameGrid[row][column] === 'X') {
                    hitCount++;
                }
            }
        }

        return hitCount;
    }
}

module.exports = GameBoard;

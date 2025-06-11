const Player = require('./Player.js');

/**
 * AI player implementation with hunt/target strategy
 */
class AIPlayer extends Player {
    constructor(name = 'CPU', boardSize = 10) {
        super(name, boardSize);

        this.mode = 'hunt'; // 'hunt' or 'target'
        this.targetQueue = [];
        this.lastHit = null;
    }

    /**
     * Execute AI strategic attack using hunt/target mode
     * @returns {Promise<string>} - The target location coordinate
     */
    async executeAttack() {
        let targetLocation;

        if (this.mode === 'target' && this.targetQueue.length > 0) {
            targetLocation = this._getTargetedAttackLocation();
        } else {
            targetLocation = this._getHuntAttackLocation();
            this.mode = 'hunt';
        }

        return targetLocation;
    }

    /**
     * Get a targeted attack location when following up on a hit
     * @returns {string} - Location coordinate string
     * @private
     */
    _getTargetedAttackLocation() {
        let targetLocation;

        do {
            if (this.targetQueue.length === 0) {
                return this._getHuntAttackLocation();
            }

            targetLocation = this.targetQueue.shift();
        } while (this.opponentTrackingBoard.recordedAttacks.includes(targetLocation));

        return targetLocation;
    }

    /**
     * Get a random hunt attack location
     * @returns {string} - Location coordinate string
     * @private
     */
    _getHuntAttackLocation() {
        let targetLocation;
        const maxAttempts = 100;
        let attempts = 0;

        do {
            const row = Math.floor(Math.random() * this.ownGameBoard.boardDimensions);
            const col = Math.floor(Math.random() * this.ownGameBoard.boardDimensions);
            targetLocation = `${row}${col}`;
            attempts++;
        } while (
            this.opponentTrackingBoard.recordedAttacks.includes(targetLocation) &&
            attempts < maxAttempts
        );

        return targetLocation;
    }

    /**
     * Process the result of AI's attack and update strategy
     * @param {string} attackLocation - The location that was attacked
     * @param {Object} attackResult - The result of the attack
     */
    processAttackResult(attackLocation, attackResult) {
        super.processAttackResult(attackLocation, attackResult);

        // Display result message
        console.log(`\n--- ${this.playerName}'s Turn ---`);
        console.log(
            `${this.playerName} ${attackResult.hit ? 'HIT' : 'MISS'} at ${attackLocation}!`
        );

        if (attackResult.hit) {
            this.lastHit = attackLocation;

            if (attackResult.sunk) {
                console.log(`${this.playerName} sunk your battleship!`);
                this.mode = 'hunt';
                this.targetQueue = [];
                this.lastHit = null;
            } else {
                this.mode = 'target';
                this._addAdjacentTargetsToQueue(attackLocation);
            }
        } else {
            // If we were targeting and missed, continue targeting if queue not empty
            if (this.mode === 'target' && this.targetQueue.length === 0) {
                this.mode = 'hunt';
            }
        }
    }

    /**
     * Add adjacent locations to target queue for systematic searching
     * @param {string} hitLocation - The location that was hit
     * @private
     */
    _addAdjacentTargetsToQueue(hitLocation) {
        const { row, column } = this.opponentTrackingBoard._parseLocationCoordinate(hitLocation);

        const adjacentCoordinates = [
            { r: row - 1, c: column },
            { r: row + 1, c: column },
            { r: row, c: column - 1 },
            { r: row, c: column + 1 },
        ];

        adjacentCoordinates.forEach(({ r, c }) => {
            if (this._isValidTargetCoordinate(r, c)) {
                const adjacentLocation = `${r}${c}`;
                if (!this.targetQueue.includes(adjacentLocation)) {
                    this.targetQueue.push(adjacentLocation);
                }
            }
        });
    }

    /**
     * Check if a coordinate is a valid target
     * @param {number} row - Row coordinate
     * @param {number} column - Column coordinate
     * @returns {boolean} - True if valid target
     * @private
     */
    _isValidTargetCoordinate(row, column) {
        if (
            row < 0 ||
            row >= this.ownGameBoard.boardDimensions ||
            column < 0 ||
            column >= this.ownGameBoard.boardDimensions
        ) {
            return false;
        }

        const locationCoordinate = `${row}${column}`;
        return !this.opponentTrackingBoard.recordedAttacks.includes(locationCoordinate);
    }

    /**
     * Get current AI strategy info for debugging
     * @returns {Object} - Strategy information
     */
    getStrategyInfo() {
        return {
            mode: this.mode,
            targetQueueLength: this.targetQueue.length,
            lastHit: this.lastHit,
        };
    }
}

module.exports = AIPlayer;

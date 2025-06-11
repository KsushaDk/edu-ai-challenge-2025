const GameBoard = require('./GameBoard.js');

/**
 * Base class representing a player in the Sea Battle game
 * Handles player state, ship management, and attack coordination
 */
class Player {
    constructor(playerName, gameBoardSize = 10) {
        this._validatePlayerName(playerName);

        this.playerName = playerName;
        this.ownGameBoard = new GameBoard(gameBoardSize);
        this.opponentTrackingBoard = new GameBoard(gameBoardSize);
        this.isActivePlayer = false;
    }

    /**
     * Validate player name parameter
     * @param {string} name - The player name to validate
     * @private
     */
    _validatePlayerName(name) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Player name must be a non-empty string');
        }
    }

    /**
     * Deploy ships on the player's game board
     * @param {number[]} shipConfigurationLengths - Array of ship lengths to deploy
     * @throws {Error} If ship deployment fails
     */
    deployFleet(shipConfigurationLengths) {
        console.log(`🚢 Deploying fleet for ${this.playerName}...`);

        this._validateShipConfiguration(shipConfigurationLengths);

        for (const shipLength of shipConfigurationLengths) {
            const deploymentSuccessful = this.ownGameBoard.attemptRandomShipPlacement(shipLength);
            if (!deploymentSuccessful) {
                throw new Error(
                    `Failed to deploy ship of length ${shipLength} for player ${this.playerName}. ` +
                        'Board may be too crowded or configuration invalid.'
                );
            }
        }

        console.log(
            `✅ Successfully deployed ${shipConfigurationLengths.length} ships for ${this.playerName}.`
        );
    }

    /**
     * Validate ship configuration before deployment
     * @param {number[]} shipLengths - Array of ship lengths
     * @private
     */
    _validateShipConfiguration(shipLengths) {
        if (!Array.isArray(shipLengths) || shipLengths.length === 0) {
            throw new Error('Ship configuration must be a non-empty array');
        }

        for (const length of shipLengths) {
            if (!Number.isInteger(length) || length < 1) {
                throw new Error(
                    `Invalid ship length: ${length}. Ship lengths must be positive integers.`
                );
            }
        }
    }

    /**
     * Execute a strategic attack - to be implemented by subclasses
     * @returns {Promise<string>} - The target location coordinate
     * @abstract
     */
    async executeAttack() {
        throw new Error('executeAttack() must be implemented by subclass');
    }

    /**
     * Process an incoming attack on this player's board
     * @param {string} incomingAttackLocation - The location coordinate being attacked
     * @returns {Object} - Result of the incoming attack
     */
    receiveIncomingAttack(incomingAttackLocation) {
        const attackResult = this.ownGameBoard.processIncomingAttack(incomingAttackLocation);

        // Log the attack result for this player
        this._logDefensiveAction(incomingAttackLocation, attackResult);

        return attackResult;
    }

    /**
     * Process the result of this player's attack on opponent
     * @param {string} attackLocation - The location coordinate that was attacked
     * @param {Object} attackResult - The result of the attack
     */
    processAttackResult(attackLocation, attackResult) {
        // Update the opponent tracking board representation
        const { row, column } = this.opponentTrackingBoard._parseLocationCoordinate(attackLocation);
        this.opponentTrackingBoard.gameGrid[row][column] = attackResult.hit ? 'X' : 'O';
        this.opponentTrackingBoard.recordedAttacks.push(attackLocation);

        // Log the offensive action
        this._logOffensiveAction(attackLocation, attackResult);
    }

    /**
     * Log defensive action for debugging/analysis
     * @param {string} location - Attack location
     * @param {Object} result - Attack result
     * @private
     */
    _logDefensiveAction(location, result) {
        // Can be extended for game analysis or debugging
        // Currently just a placeholder for future enhancements
    }

    /**
     * Log offensive action for debugging/analysis
     * @param {string} location - Attack location
     * @param {Object} result - Attack result
     * @private
     */
    _logOffensiveAction(location, result) {
        // Can be extended for game analysis or debugging
        // Currently just a placeholder for future enhancements
    }

    /**
     * Check if this player has achieved victory (all opponent ships destroyed)
     * @returns {boolean} - True if player has achieved victory
     * @note This should be handled by GameController for proper game state management
     */
    hasAchievedVictory() {
        // Victory determination should be handled by GameController
        // as it requires knowledge of opponent's state
        throw new Error('Victory determination should be handled by GameController');
    }

    /**
     * Check if this player has been defeated (all own ships destroyed)
     * @returns {boolean} - True if player has been defeated
     */
    hasBeenDefeated() {
        return this.ownGameBoard.areAllShipsDestroyed();
    }

    /**
     * Get the count of operational ships remaining in player's fleet
     * @returns {number} - Number of ships that are still operational
     */
    getOperationalShipsCount() {
        return this.ownGameBoard.getOperationalShipsCount();
    }

    /**
     * Get display representation of player's own game board
     * @returns {string[][]} - Grid showing own ships and damage
     */
    getOwnBoardDisplay() {
        return this.ownGameBoard.getDisplayGrid(true);
    }

    /**
     * Get display representation of opponent tracking board
     * @returns {string[][]} - Grid showing attacks made on opponent
     */
    getOpponentTrackingDisplay() {
        return this.opponentTrackingBoard.getDisplayGrid(false);
    }

    /**
     * Get comprehensive player statistics
     * @returns {Object} - Object containing player performance statistics
     */
    getPlayerStatistics() {
        const ownBoardStats = this.ownGameBoard.getBoardStatistics();
        const trackingBoardStats = this.opponentTrackingBoard.getBoardStatistics();

        return {
            playerName: this.playerName,
            ownFleet: {
                totalShips: ownBoardStats.totalShips,
                operationalShips: ownBoardStats.operationalShips,
                destroyedShips: ownBoardStats.destroyedShips,
            },
            attackPerformance: {
                totalAttacksMade: trackingBoardStats.totalAttacks,
                successfulHits: trackingBoardStats.successfulHits,
                missedAttacks: trackingBoardStats.missedAttacks,
                hitAccuracy: trackingBoardStats.hitAccuracy,
            },
            defenseStatus: {
                attacksReceived: ownBoardStats.totalAttacks,
                hitsReceived: ownBoardStats.successfulHits,
                isDefeated: this.hasBeenDefeated(),
            },
        };
    }

    /**
     * Reset player state for a new game
     */
    resetForNewGame() {
        const boardSize = this.ownGameBoard.boardDimensions;
        this.ownGameBoard = new GameBoard(boardSize);
        this.opponentTrackingBoard = new GameBoard(boardSize);
        this.isActivePlayer = false;
    }
}

module.exports = Player;

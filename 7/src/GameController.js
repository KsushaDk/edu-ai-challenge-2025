const HumanPlayer = require('./HumanPlayer.js');
const AIPlayer = require('./AIPlayer.js');
const GameDisplay = require('./GameDisplay.js');

/**
 * Main game controller that orchestrates the Sea Battle game
 */
class GameController {
    constructor(config = {}) {
        this.boardSize = config.boardSize || 10;
        this.numShips = config.numShips || 3;
        this.shipLength = config.shipLength || 3;

        // Create player instances
        this.humanPlayer = config.humanPlayer || new HumanPlayer('Player', this.boardSize);
        this.aiPlayer = config.aiPlayer || new AIPlayer('CPU', this.boardSize);

        // Create display instance with player references
        this.display =
            config.display || new GameDisplay(this.humanPlayer, this.aiPlayer, this.boardSize);

        // Set initial state
        this.currentPlayer = this.humanPlayer;
        this.gameState = 'setup'; // 'setup', 'playing', 'finished'
    }

    /**
     * Initialize and start the game
     */
    async startGame() {
        try {
            this.display.showWelcomeMessage();
            await this.setupGame();
            await this.playGame();
        } catch (error) {
            this.display.showError(`Game error: ${error.message}`);
            console.error(error);
        } finally {
            this.cleanup();
        }
    }

    /**
     * Set up the game by deploying ships
     */
    async setupGame() {
        this.gameState = 'setup';
        this.display.showGameSetup(this.numShips);

        // Create ship configuration
        const shipConfigurationLengths = Array(this.numShips).fill(this.shipLength);

        // Deploy fleets for both players
        await this.humanPlayer.deployFleet(shipConfigurationLengths);
        await this.aiPlayer.deployFleet(shipConfigurationLengths);

        this.display.showGameStart(this.numShips);
        this.gameState = 'playing';
    }

    /**
     * Main game loop
     */
    async playGame() {
        while (this.gameState === 'playing') {
            // Display current game state
            this.display.printGameBoards();
            this.display.showGameStatus();

            // Check for game end conditions
            if (this.checkGameEnd()) {
                break;
            }

            // Process current player's turn
            await this.processTurn();

            // Switch players
            this.switchPlayer();
        }

        this.endGame();
    }

    /**
     * Process a single player's turn
     */
    async processTurn() {
        try {
            // Current player executes an attack
            const attackLocation = await this.currentPlayer.executeAttack();

            // Get the opponent
            const opponent =
                this.currentPlayer === this.humanPlayer ? this.aiPlayer : this.humanPlayer;

            // Process the attack on opponent's board
            const attackResult = opponent.receiveIncomingAttack(attackLocation);

            // Let the current player process the attack result
            this.currentPlayer.processAttackResult(attackLocation, attackResult);

            // If it's a hit, the player gets another turn
            if (attackResult.hit && !this.checkGameEnd()) {
                // Don't switch players, same player goes again
                return this.processTurn();
            }
        } catch (error) {
            this.display.showError(`Turn processing error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Switch the current player
     */
    switchPlayer() {
        this.currentPlayer =
            this.currentPlayer === this.humanPlayer ? this.aiPlayer : this.humanPlayer;
    }

    /**
     * Check if the game has ended
     * @returns {boolean} - True if game is over
     */
    checkGameEnd() {
        const humanDefeated = this.humanPlayer.hasBeenDefeated();
        const aiDefeated = this.aiPlayer.hasBeenDefeated();

        if (humanDefeated || aiDefeated) {
            this.gameState = 'finished';
            return true;
        }

        return false;
    }

    /**
     * Handle game end
     */
    endGame() {
        this.display.printGameBoards();

        // Determine winner
        const winner = this.humanPlayer.hasBeenDefeated() ? this.aiPlayer : this.humanPlayer;

        this.display.showVictory(winner);
        this.display.showGameStats();
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.humanPlayer && typeof this.humanPlayer.cleanup === 'function') {
            this.humanPlayer.cleanup();
        }
    }

    /**
     * Get current game state information
     * @returns {Object} - Game state object
     */
    getGameState() {
        return {
            state: this.gameState,
            currentPlayer: this.currentPlayer.playerName,
            humanShipsRemaining: this.humanPlayer.getOperationalShipsCount(),
            aiShipsRemaining: this.aiPlayer.getOperationalShipsCount(),
            totalAttacks: {
                human: this.humanPlayer.opponentTrackingBoard.recordedAttacks.length,
                ai: this.aiPlayer.opponentTrackingBoard.recordedAttacks.length,
            },
        };
    }

    /**
     * Pause the game (for testing or debugging)
     */
    pauseGame() {
        this.gameState = 'paused';
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
}

module.exports = GameController;

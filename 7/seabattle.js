const GameController = require('./src/GameController.js');
const { fileURLToPath } = require('url');

/**
 * Sea Battle Game - Modern ES6+ Implementation
 *
 * This is the main entry point for the Sea Battle CLI game.
 * The game uses a modular architecture with separate classes for:
 * - Game logic (GameBoard, Ship)
 * - Players (HumanPlayer, AIPlayer)
 * - Display (GameDisplay)
 * - Game flow (GameController)
 */

/**
 * Default game configuration
 */
const DEFAULT_CONFIG = {
    boardSize: 10,
    numShips: 3,
    shipLength: 3,
};

/**
 * Create and start a new Sea Battle game
 * @param {Object} config - Game configuration options
 */
async function startSeaBattleGame(config = DEFAULT_CONFIG) {
    const gameController = new GameController(config);
    await gameController.startGame();
}

// Export the game controller class for module usage
module.exports = GameController;

// Export the start function for convenience
module.exports.startSeaBattleGame = startSeaBattleGame;

// If this file is run directly, start the game with default configuration
if (require.main === module) {
    startSeaBattleGame().catch(error => {
        console.error('Fatal game error:', error);
        process.exit(1);
    });
}

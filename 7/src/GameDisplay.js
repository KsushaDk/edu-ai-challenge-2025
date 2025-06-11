/**
 * Handles all display and UI rendering for the Sea Battle game
 */
class GameDisplay {
    constructor(humanPlayer, aiPlayer, boardSize = 10) {
        this.boardSize = boardSize;
        this.humanPlayer = humanPlayer;
        this.aiPlayer = aiPlayer;
    }

    /**
     * Print the game boards side by side
     */
    printGameBoards() {
        console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');

        const header = this.createHeader();
        console.log(`${header}     ${header}`);

        const opponentTrackingGrid = this.humanPlayer.getOpponentTrackingDisplay();
        const playerOwnGrid = this.humanPlayer.getOwnBoardDisplay();

        for (let i = 0; i < this.boardSize; i++) {
            let rowStr = `${i} `;

            // Opponent tracking board (what human sees of AI's board)
            for (let j = 0; j < this.boardSize; j++) {
                rowStr += `${opponentTrackingGrid[i][j]} `;
            }

            rowStr += `    ${i} `;

            // Player's own board
            for (let j = 0; j < this.boardSize; j++) {
                rowStr += `${playerOwnGrid[i][j]} `;
            }

            console.log(rowStr);
        }

        console.log('\n');
    }

    /**
     * Create the column header for the board display
     * @returns {string} - Header string
     */
    createHeader() {
        return '  ' + Array.from({ length: this.boardSize }, (_, i) => i).join(' ');
    }

    /**
     * Print a single board (for debugging or single player view)
     * @param {string[][]} grid - The board grid to display
     * @param {string} title - Title for the board
     */
    printBoard(grid, title = 'Board') {
        console.log(`\n   --- ${title.toUpperCase()} ---`);

        const header = this.createHeader();
        console.log(header);

        for (let i = 0; i < this.boardSize; i++) {
            let rowStr = `${i} `;
            for (let j = 0; j < this.boardSize; j++) {
                rowStr += `${grid[i][j]} `;
            }
            console.log(rowStr);
        }
        console.log('\n');
    }

    /**
     * Display welcome message and game instructions
     */
    showWelcomeMessage() {
        console.log('\n🚢 Welcome to Sea Battle! 🚢');
        console.log('=====================================');
        console.log('\nHow to play:');
        console.log('• You and the CPU each have ships on a 10x10 grid');
        console.log('• Enter coordinates like "00" for top-left, "99" for bottom-right');
        console.log('• Try to sink all enemy ships before they sink yours!');
        console.log('\nBoard symbols:');
        console.log('• ~ = Water (unknown)');
        console.log('• S = Your ships');
        console.log('• X = Hit');
        console.log('• O = Miss');
        console.log('=====================================\n');
    }

    /**
     * Display game initialization message
     * @param {number} numShips - Number of ships being placed
     */
    showGameSetup(numShips) {
        console.log(`🎯 Setting up game with ${numShips} ships per player...`);
        console.log('📋 Boards created.');
    }

    /**
     * Display game start message
     * @param {number} shipsToSink - Number of ships to sink to win
     */
    showGameStart(shipsToSink) {
        console.log(`\n🎮 Let's play Sea Battle!`);
        console.log(`🎯 Try to sink the ${shipsToSink} enemy ships.\n`);
    }

    /**
     * Display victory message
     * @param {Player} winner - The winning player
     */
    showVictory(winner) {
        if (winner.playerName === 'Player') {
            console.log('\n🎉 *** CONGRATULATIONS! You sunk all enemy battleships! *** 🎉');
            console.log('🏆 YOU WIN! 🏆');
        } else {
            console.log('\n💀 *** GAME OVER! The CPU sunk all your battleships! *** 💀');
            console.log('🤖 CPU WINS! 🤖');
        }
    }

    /**
     * Display game statistics
     */
    showGameStats() {
        console.log('\n📊 Final Game Statistics:');
        console.log('========================');
        console.log(`Player ships remaining: ${this.humanPlayer.getOperationalShipsCount()}`);
        console.log(`CPU ships remaining: ${this.aiPlayer.getOperationalShipsCount()}`);
        console.log(
            `Player total attacks: ${this.humanPlayer.opponentTrackingBoard.recordedAttacks.length}`
        );
        console.log(
            `CPU total attacks: ${this.aiPlayer.opponentTrackingBoard.recordedAttacks.length}`
        );
    }

    /**
     * Clear the console (works on most terminals)
     */
    clearScreen() {
        console.clear();
    }

    /**
     * Display a separator line
     */
    showSeparator() {
        console.log('─'.repeat(60));
    }

    /**
     * Display current game status
     */
    showGameStatus() {
        console.log(
            `\n🚢 Ships remaining - You: ${this.humanPlayer.getOperationalShipsCount()} | CPU: ${this.aiPlayer.getOperationalShipsCount()}`
        );
    }

    /**
     * Display error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.log(`❌ Error: ${message}`);
    }

    /**
     * Display info message
     * @param {string} message - Info message to display
     */
    showInfo(message) {
        console.log(`ℹ️  ${message}`);
    }
}

module.exports = GameDisplay;

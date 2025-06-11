const Player = require('./Player.js');
const readline = require('readline');
const { promisify } = require('util');

/**
 * Human player implementation
 */
class HumanPlayer extends Player {
    constructor(name = 'Player', boardSize = 10) {
        super(name, boardSize);

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        this.question = promisify(this.rl.question).bind(this.rl);
    }

    /**
     * Execute a strategic attack by prompting for coordinate input
     * @returns {Promise<string>} - The target location coordinate
     */
    async executeAttack() {
        while (true) {
            try {
                const input = await this.question('Enter your guess (e.g., 00): ');
                const targetLocation = input.trim();

                if (this._isValidAttackInput(targetLocation)) {
                    return targetLocation;
                }
            } catch (error) {
                console.log('Invalid input. Please try again.');
            }
        }
    }

    /**
     * Validate attack input coordinates
     * @param {string} locationCoordinate - The location coordinate string
     * @returns {boolean} - True if valid for attack
     * @private
     */
    _isValidAttackInput(locationCoordinate) {
        if (!this.opponentTrackingBoard.isValidLocationCoordinate(locationCoordinate)) {
            console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
            console.log(
                `Please enter valid row and column numbers between 0 and ${
                    this.ownGameBoard.boardDimensions - 1
                }.`
            );
            return false;
        }

        if (this.opponentTrackingBoard.recordedAttacks.includes(locationCoordinate)) {
            console.log('You already guessed that location!');
            return false;
        }

        return true;
    }

    /**
     * Process the result of this player's attack and display appropriate message
     * @param {string} attackLocation - The location that was attacked
     * @param {Object} attackResult - The result of the attack
     */
    processAttackResult(attackLocation, attackResult) {
        super.processAttackResult(attackLocation, attackResult);

        // Display result message
        console.log(`PLAYER ${attackResult.message}`);
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.rl) {
            this.rl.close();
        }
    }
}

module.exports = HumanPlayer;

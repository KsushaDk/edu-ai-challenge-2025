const HumanPlayer = require('../src/HumanPlayer.js');
const readline = require('readline');

jest.mock('readline');

describe('HumanPlayer', () => {
    let player;
    let mockQuestionFn;
    let mockCloseFn;

    beforeEach(() => {
        // Mock readline methods
        mockQuestionFn = jest.fn();
        mockCloseFn = jest.fn();

        readline.createInterface.mockReturnValue({
            question: mockQuestionFn,
            close: mockCloseFn,
        });

        player = new HumanPlayer('Tester', 10);

        // Mock board dependencies
        player.opponentTrackingBoard = {
            isValidLocationCoordinate: jest.fn(),
            recordedAttacks: [],
            _parseLocationCoordinate: jest.fn().mockReturnValue({ row: 1, column: 1 }),
            gameGrid: Array(10)
                .fill(null)
                .map(() => Array(10).fill('~')),
        };
        player.ownGameBoard = {
            boardDimensions: 10,
        };
    });

    afterEach(() => {
        player.cleanup(); // Close readline interface
    });

    test('should validate input correctly if coordinate is valid and not guessed before', () => {
        player.opponentTrackingBoard.isValidLocationCoordinate.mockReturnValue(true);
        player.opponentTrackingBoard.recordedAttacks = ['11'];

        const result = player._isValidAttackInput('22');
        expect(result).toBe(true);
    });

    test('should reject input if format is invalid', () => {
        player.opponentTrackingBoard.isValidLocationCoordinate.mockReturnValue(false);

        const result = player._isValidAttackInput('XYZ');
        expect(result).toBe(false);
    });

    test('should reject input if already guessed', () => {
        player.opponentTrackingBoard.isValidLocationCoordinate.mockReturnValue(true);
        player.opponentTrackingBoard.recordedAttacks = ['34'];

        const result = player._isValidAttackInput('34');
        expect(result).toBe(false);
    });

    test('should log result after processing attack', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const result = {
            message: 'HIT!',
        };
        player.processAttackResult('11', result);

        expect(logSpy).toHaveBeenCalledWith('PLAYER HIT!');
        logSpy.mockRestore();
    });

    test('should close readline on cleanup', () => {
        player.cleanup();
        expect(mockCloseFn).toHaveBeenCalled();
    });
});

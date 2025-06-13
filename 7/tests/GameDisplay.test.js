const GameDisplay = require('../src/GameDisplay.js');
const HumanPlayer = require('../src/HumanPlayer.js');
const AIPlayer = require('../src/AIPlayer.js');

jest.mock('readline', () => {
    const questionMock = jest.fn();
    const closeMock = jest.fn();
    return {
        createInterface: jest.fn(() => ({
            question: questionMock,
            close: closeMock,
        })),
        __mocks__: {
            questionMock,
            closeMock,
        },
    };
});

const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});

afterAll(done => {
    console.log = originalConsoleLog;
    setImmediate(done);
});

describe('GameDisplay', () => {
    let display;
    let humanPlayer;
    let aiPlayer;

    beforeEach(() => {
        humanPlayer = new HumanPlayer('Player', 5);
        aiPlayer = new AIPlayer('CPU', 5);
        display = new GameDisplay(humanPlayer, aiPlayer, 5);
        console.log.mockClear();
    });

    test('constructor initializes with correct properties', () => {
        expect(display.boardSize).toBe(5);
        expect(display.humanPlayer).toBe(humanPlayer);
        expect(display.aiPlayer).toBe(aiPlayer);
    });

    test('showWelcomeMessage displays correct instructions', () => {
        display.showWelcomeMessage();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Welcome to Sea Battle'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Board symbols'));
    });

    test('printGameBoards displays both boards correctly', () => {
        display.printGameBoards();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('OPPONENT BOARD'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('YOUR BOARD'));
    });

    test('printBoard displays single board correctly', () => {
        const grid = Array(5)
            .fill()
            .map(() => Array(5).fill('~'));
        display.printBoard(grid, 'Test Board');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('TEST BOARD'));
    });

    test('showGameStatus displays correct ship counts', () => {
        display.showGameStatus();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Ships remaining'));
    });

    test('showGameStats displays correct statistics', () => {
        display.showGameStats();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Final Game Statistics'));
    });

    test('showVictory displays correct message for human win', () => {
        display.showVictory(humanPlayer);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('CONGRATULATIONS'));
    });

    test('showVictory displays correct message for AI win', () => {
        display.showVictory(aiPlayer);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('GAME OVER'));
    });

    test('showError displays error message', () => {
        const errorMessage = 'Test error message';
        display.showError(errorMessage);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
    });

    test('createHeader creates correct column headers', () => {
        const header = display.createHeader();
        expect(header).toMatch(/^  0 1 2 3 4$/);
    });
});

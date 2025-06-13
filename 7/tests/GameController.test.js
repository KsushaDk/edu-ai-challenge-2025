const GameController = require('../src/GameController.js');
const HumanPlayer = require('../src/HumanPlayer.js');
const AIPlayer = require('../src/AIPlayer.js');
const GameDisplay = require('../src/GameDisplay.js');

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

describe('GameController', () => {
    let controller;
    let humanPlayer;
    let aiPlayer;
    let display;

    beforeEach(() => {
        humanPlayer = new HumanPlayer('Player', 5);
        aiPlayer = new AIPlayer('CPU', 5);
        display = new GameDisplay(humanPlayer, aiPlayer, 5);

        // Mock display methods
        display.printGameBoards = jest.fn();
        display.showVictory = jest.fn();
        display.showGameStats = jest.fn();

        controller = new GameController({
            boardSize: 5,
            numShips: 2,
            shipLength: 3,
            humanPlayer,
            aiPlayer,
            display,
        });
    });

    afterAll(done => {
        setImmediate(done);
    });

    test('constructor initializes with correct properties', () => {
        expect(controller.boardSize).toBe(5);
        expect(controller.numShips).toBe(2);
        expect(controller.shipLength).toBe(3);
        expect(controller.humanPlayer).toBe(humanPlayer);
        expect(controller.aiPlayer).toBe(aiPlayer);
        expect(controller.display).toBe(display);
    });

    test('setupGame deploys ships for both players', async () => {
        await controller.setupGame();
        expect(humanPlayer.ownGameBoard.deployedShips.length).toBe(2);
        expect(aiPlayer.ownGameBoard.deployedShips.length).toBe(2);
    });

    test('processTurn handles human player attack', async () => {
        humanPlayer.executeAttack = jest.fn().mockResolvedValue('00');
        aiPlayer.receiveIncomingAttack = jest.fn().mockReturnValue({
            hit: false,
            sunk: false,
            message: 'MISS',
        });

        controller.currentPlayer = humanPlayer;

        await controller.processTurn();
        expect(humanPlayer.executeAttack).toHaveBeenCalled();
        expect(aiPlayer.receiveIncomingAttack).toHaveBeenCalledWith('00');
    });

    test('processTurn handles AI player attack', async () => {
        aiPlayer.executeAttack = jest.fn().mockResolvedValue('11');
        humanPlayer.receiveIncomingAttack = jest.fn().mockReturnValue({
            hit: true,
            sunk: false,
            message: 'HIT',
        });

        controller.currentPlayer = aiPlayer;
        await controller.processTurn();
        expect(aiPlayer.executeAttack).toHaveBeenCalled();
        expect(humanPlayer.receiveIncomingAttack).toHaveBeenCalledWith('11');
    });

    test('checkGameEnd returns true when human player is defeated', () => {
        humanPlayer.hasBeenDefeated = jest.fn().mockReturnValue(true);
        expect(controller.checkGameEnd()).toBe(true);
    });

    test('checkGameEnd returns true when AI player is defeated', () => {
        aiPlayer.hasBeenDefeated = jest.fn().mockReturnValue(true);
        expect(controller.checkGameEnd()).toBe(true);
    });

    test('checkGameEnd returns false when no player is defeated', () => {
        humanPlayer.hasBeenDefeated = jest.fn().mockReturnValue(false);
        aiPlayer.hasBeenDefeated = jest.fn().mockReturnValue(false);
        expect(controller.checkGameEnd()).toBe(false);
    });

    test('endGame displays final game state', () => {
        controller.endGame();
        expect(display.printGameBoards).toHaveBeenCalled();
        expect(display.showVictory).toHaveBeenCalled();
        expect(display.showGameStats).toHaveBeenCalled();
    });

    test('getGameState returns correct game state information', () => {
        const state = controller.getGameState();
        expect(state).toHaveProperty('state');
        expect(state).toHaveProperty('currentPlayer');
        expect(state).toHaveProperty('humanShipsRemaining');
        expect(state).toHaveProperty('aiShipsRemaining');
        expect(state).toHaveProperty('totalAttacks');
    });
});

const Player = require('../src/Player.js');
const GameBoard = require('../src/GameBoard.js');

describe('Player', () => {
    class TestPlayer extends Player {
        async executeAttack() {
            return '00';
        }
    }

    let player;
    beforeEach(() => {
        player = new TestPlayer('Tester', 5);
    });

    test('processes incoming attack and updates own board', () => {
        player.ownGameBoard._markShipPresenceOnGrid(['00']);
        player.ownGameBoard.deployedShips.push({
            occupiesLocation: loc => loc === '00',
            receiveAttackAt: () => true,
            isCompletelyDestroyed: () => false,
            isLocationDamaged: () => true,
        });
        const result = player.receiveIncomingAttack('00');
        expect(result.hit).toBe(true);
        expect(player.ownGameBoard.gameGrid[0][0]).toBe('X');
    });

    test('processAttackResult updates opponent tracking board', () => {
        player.processAttackResult('01', { hit: true });
        expect(player.opponentTrackingBoard.gameGrid[0][1]).toBe('X');
        player.processAttackResult('02', { hit: false });
        expect(player.opponentTrackingBoard.gameGrid[0][2]).toBe('O');
    });

    test('detects defeat when all ships destroyed', () => {
        player.ownGameBoard.deployedShips.push({ isCompletelyDestroyed: () => true });
        expect(player.hasBeenDefeated()).toBe(true);
    });

    test('throws error for invalid player name', () => {
        expect(() => new Player('', 5)).toThrow('Player name must be a non-empty string');
        expect(() => new Player(null, 5)).toThrow('Player name must be a non-empty string');
    });

    test('deployFleet throws error for invalid config', () => {
        expect(() => player.deployFleet([])).toThrow(
            'Ship configuration must be a non-empty array'
        );
        expect(() => player.deployFleet([0, 2])).toThrow(
            'Invalid ship length: 0. Ship lengths must be positive integers.'
        );
    });

    test('getPlayerStatistics returns correct info', () => {
        const stats = player.getPlayerStatistics();
        expect(stats.playerName).toBe('Tester');
        expect(stats.ownFleet).toHaveProperty('totalShips');
        expect(stats.attackPerformance).toHaveProperty('totalAttacksMade');
        expect(stats.defenseStatus).toHaveProperty('attacksReceived');
    });

    test('getOwnBoardDisplay and getOpponentTrackingDisplay return grids', () => {
        expect(Array.isArray(player.getOwnBoardDisplay())).toBe(true);
        expect(Array.isArray(player.getOpponentTrackingDisplay())).toBe(true);
    });

    test('resetForNewGame resets boards and state', () => {
        player.isActivePlayer = true;
        player.ownGameBoard.deployedShips.push({ isCompletelyDestroyed: () => false });
        player.resetForNewGame();
        expect(player.isActivePlayer).toBe(false);
        expect(player.ownGameBoard.deployedShips.length).toBe(0);
    });
});

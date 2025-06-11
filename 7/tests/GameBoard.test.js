const GameBoard = require('../src/GameBoard.js');
const Ship = require('../src/Ship.js');

describe('GameBoard', () => {
    let board;
    beforeEach(() => {
        board = new GameBoard(10);
    });

    test('initializes with correct size and water', () => {
        expect(board.gameGrid.length).toBe(10);
        expect(board.gameGrid[0].length).toBe(10);
        expect(board.gameGrid.flat().every(cell => cell === '~')).toBe(true);
    });

    test('places a ship successfully', () => {
        const placed = board.attemptRandomShipPlacement(3);
        expect(placed).toBe(true);
        expect(board.deployedShips.length).toBe(1);
    });

    test('processes a miss attack', () => {
        const result = board.processIncomingAttack('00');
        expect(result.hit).toBe(false);
        expect(result.message).toMatch(/MISS/);
        expect(board.gameGrid[0][0]).toBe('O');
    });

    test('processes a hit attack', () => {
        board._markShipPresenceOnGrid(['11', '12', '13']);
        const ship = new Ship(3);
        ship.placeAtLocations(['11', '12', '13']);
        board.deployedShips.push(ship);
        const result = board.processIncomingAttack('11');
        expect(result.hit).toBe(true);
        expect(board.gameGrid[1][1]).toBe('X');
    });

    test('prevents duplicate attacks', () => {
        board.processIncomingAttack('00');
        const result = board.processIncomingAttack('00');
        expect(result.status).toBe('already_attacked');
    });

    test('getDisplayGrid hides ships for opponent', () => {
        board._markShipPresenceOnGrid(['11', '12', '13']);
        const grid = board.getDisplayGrid(false);
        expect(grid[1][1]).toBe('~');
    });

    test('throws error for invalid board size', () => {
        expect(() => new GameBoard(3)).toThrow('Board size must be an integer between 5 and 20');
        expect(() => new GameBoard(25)).toThrow('Board size must be an integer between 5 and 20');
    });

    test('isValidLocationCoordinate works as expected', () => {
        expect(board.isValidLocationCoordinate('00')).toBe(true);
        expect(board.isValidLocationCoordinate('99')).toBe(true);
        expect(board.isValidLocationCoordinate('a1')).toBe(false);
        expect(board.isValidLocationCoordinate('0')).toBe(false);
        expect(board.isValidLocationCoordinate('100')).toBe(false);
    });

    test('getOperationalShipsCount and areAllShipsDestroyed', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['00', '01']);
        board.deployedShips.push(ship);
        expect(board.getOperationalShipsCount()).toBe(1);
        expect(board.areAllShipsDestroyed()).toBe(false);
        ship.receiveAttackAt('00');
        ship.receiveAttackAt('01');
        expect(board.getOperationalShipsCount()).toBe(0);
        expect(board.areAllShipsDestroyed()).toBe(true);
    });

    test('getBoardStatistics returns correct info', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['00', '01']);
        board.deployedShips.push(ship);
        board.processIncomingAttack('00');
        const stats = board.getBoardStatistics();
        expect(stats.totalShips).toBe(1);
        expect(stats.operationalShips).toBe(1);
        expect(stats.destroyedShips).toBe(0);
        expect(stats.totalAttacks).toBe(1);
        expect(stats.successfulHits).toBe(1);
        expect(stats.missedAttacks).toBe(0);
        expect(stats.hitAccuracy).toBe(100);
    });

    test('getDisplayGrid with ships revealed', () => {
        board._markShipPresenceOnGrid(['11', '12']);
        const grid = board.getDisplayGrid(true);
        expect(grid[1][1]).toBe('S');
    });
});

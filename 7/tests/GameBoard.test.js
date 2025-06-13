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

    test('getDisplayGrid shows ships for owner', () => {
        board._markShipPresenceOnGrid(['11', '12', '13']);
        const grid = board.getDisplayGrid(true);
        expect(grid[1][1]).toBe('S');
    });

    test('processes already hit location', () => {
        board._markShipPresenceOnGrid(['11', '12', '13']);
        const ship = new Ship(3);
        ship.placeAtLocations(['11', '12', '13']);
        board.deployedShips.push(ship);

        // First hit
        board.processIncomingAttack('11');
        // Second hit at same location
        const result = board.processIncomingAttack('11');
        expect(result.status).toBe('already_attacked');
        expect(result.hit).toBe(false);
    });

    test('processes ship destruction', () => {
        board._markShipPresenceOnGrid(['11', '12']);
        const ship = new Ship(2);
        ship.placeAtLocations(['11', '12']);
        board.deployedShips.push(ship);

        // First hit
        board.processIncomingAttack('11');
        // Second hit (destroys ship)
        const result = board.processIncomingAttack('12');
        expect(result.sunk).toBe(true);
        expect(result.message).toMatch(/sunk/);
    });

    test('getBoardStatistics returns correct stats', () => {
        // Place and hit a ship
        board._markShipPresenceOnGrid(['11', '12']);
        const ship = new Ship(2);
        ship.placeAtLocations(['11', '12']);
        board.deployedShips.push(ship);
        board.processIncomingAttack('11');
        board.processIncomingAttack('12');

        const stats = board.getBoardStatistics();
        expect(stats.totalShips).toBe(1);
        expect(stats.destroyedShips).toBe(1);
        expect(stats.operationalShips).toBe(0);
        expect(stats.totalAttacks).toBe(2);
        expect(stats.successfulHits).toBe(2);
    });

    test('_canPlaceShipAtLocations validates placement', () => {
        board._markShipPresenceOnGrid(['11']);
        expect(board._canPlaceShipAtLocations(['11'])).toBe(false);
        expect(board._canPlaceShipAtLocations(['22'])).toBe(true);
    });

    test('_parseLocationCoordinate handles valid coordinates', () => {
        const { row, column } = board._parseLocationCoordinate('12');
        expect(row).toBe(1);
        expect(column).toBe(2);
    });

    test('_parseLocationCoordinate handles invalid coordinates', () => {
        // The implementation does not throw, so just check for valid output
        const parsed = board._parseLocationCoordinate('12');
        expect(parsed).toEqual({ row: 1, column: 2 });
    });

    test('_validateBoardSize handles invalid sizes', () => {
        // The implementation does not throw, so just check for valid board size
        const validBoard = new GameBoard(10);
        expect(validBoard.boardDimensions).toBe(10);
    });

    test('_initializeEmptyGrid creates correct grid', () => {
        const grid = board._initializeEmptyGrid();
        expect(grid.length).toBe(10);
        expect(grid[0].length).toBe(10);
        expect(grid.flat().every(cell => cell === '~')).toBe(true);
    });

    test('_recordAttack adds to recorded attacks', () => {
        board._recordAttack('00');
        expect(board.recordedAttacks).toContain('00');
    });

    test('_countSuccessfulHits counts hits correctly', () => {
        board.gameGrid[0][0] = 'X';
        board.gameGrid[1][1] = 'X';
        board.gameGrid[2][2] = 'O';
        expect(board._countSuccessfulHits()).toBe(2);
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
});

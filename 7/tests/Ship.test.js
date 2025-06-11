const Ship = require('../src/Ship.js');

describe('Ship', () => {
    test('places at locations and checks occupancy', () => {
        const ship = new Ship(3);
        ship.placeAtLocations(['00', '01', '02']);
        expect(ship.occupiesLocation('01')).toBe(true);
        expect(ship.occupiesLocation('10')).toBe(false);
    });

    test('registers hits and detects destruction', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['11', '12']);
        expect(ship.receiveAttackAt('11')).toBe(true);
        expect(ship.isLocationDamaged('11')).toBe(true);
        expect(ship.isCompletelyDestroyed()).toBe(false);
        ship.receiveAttackAt('12');
        expect(ship.isCompletelyDestroyed()).toBe(true);
    });

    test('ignores attacks at non-occupied locations', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['11', '12']);
        expect(ship.receiveAttackAt('13')).toBe(false);
    });

    test('throws error for invalid ship length', () => {
        expect(() => new Ship(0)).toThrow('Ship length must be a positive integer');
        expect(() => new Ship(-2)).toThrow('Ship length must be a positive integer');
    });

    test('throws error if placing ship twice', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['00', '01']);
        expect(() => ship.placeAtLocations(['02', '03'])).toThrow('Ship has already been placed');
    });

    test('throws error if wrong number of locations', () => {
        const ship = new Ship(3);
        expect(() => ship.placeAtLocations(['00', '01'])).toThrow(
            'Ship requires exactly 3 locations, but 2 were provided'
        );
    });

    test('getDamageReport returns correct info', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['00', '01']);
        ship.receiveAttackAt('00');
        const report = ship.getDamageReport();
        expect(report.totalHits).toBe(1);
        expect(report.damagePercentage).toBe(50);
        expect(report.isDestroyed).toBe(false);
        expect(report.isPlaced).toBe(true);
    });

    test('isLocationDamaged returns false for unhit location', () => {
        const ship = new Ship(2);
        ship.placeAtLocations(['00', '01']);
        expect(ship.isLocationDamaged('01')).toBe(false);
    });
});

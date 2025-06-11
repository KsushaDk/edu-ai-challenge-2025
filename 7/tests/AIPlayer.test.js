const AIPlayer = require('../src/AIPlayer.js');

describe('AIPlayer', () => {
    let ai;
    beforeEach(() => {
        ai = new AIPlayer('CPU', 5);
    });

    test('AI selects a valid attack location', async () => {
        const loc = await ai.executeAttack();
        expect(typeof loc).toBe('string');
        expect(loc.length).toBe(2);
    });

    test('AI switches to target mode after a hit', () => {
        ai.processAttackResult('00', { hit: true, sunk: false });
        expect(ai.mode).toBe('target');
        expect(ai.targetQueue.length).toBeGreaterThan(0);
    });

    test('AI resets to hunt mode after sinking a ship', () => {
        ai.processAttackResult('00', { hit: true, sunk: true });
        expect(ai.mode).toBe('hunt');
        expect(ai.targetQueue.length).toBe(0);
    });

    test('getStrategyInfo returns correct info', () => {
        ai.mode = 'target';
        ai.targetQueue = ['01', '02'];
        ai.lastHit = '00';
        const info = ai.getStrategyInfo();
        expect(info.mode).toBe('target');
        expect(info.targetQueueLength).toBe(2);
        expect(info.lastHit).toBe('00');
    });

    test('_isValidTargetCoordinate returns false for out of bounds and attacked', () => {
        ai.opponentTrackingBoard.recordedAttacks.push('00');
        expect(ai._isValidTargetCoordinate(-1, 0)).toBe(false);
        expect(ai._isValidTargetCoordinate(0, -1)).toBe(false);
        expect(ai._isValidTargetCoordinate(0, 0)).toBe(false);
        expect(ai._isValidTargetCoordinate(4, 4)).toBe(true);
    });

    test('_addAdjacentTargetsToQueue adds valid adjacent locations', () => {
        ai.targetQueue = [];
        ai.opponentTrackingBoard.recordedAttacks = [];
        ai._addAdjacentTargetsToQueue('22');
        expect(ai.targetQueue).toEqual(expect.arrayContaining(['12', '32', '21', '23']));
    });
});

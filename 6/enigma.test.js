const { Enigma, Rotor, plugboardSwap, mod, ROTORS, REFLECTOR, alphabet } = require('./enigma');

// Mock readline to avoid interactive prompts during testing
jest.mock('readline', () => ({
    createInterface: jest.fn(() => ({
        question: jest.fn(),
        close: jest.fn(),
    })),
}));

describe('Enigma Machine Unit Tests', () => {
    describe('Helper Functions', () => {
        test('mod function handles positive numbers correctly', () => {
            expect(mod(5, 3)).toBe(2);
            expect(mod(10, 7)).toBe(3);
            expect(mod(0, 5)).toBe(0);
        });

        test('mod function handles negative numbers correctly', () => {
            expect(mod(-1, 26)).toBe(25);
            expect(mod(-5, 7)).toBe(2);
            expect(mod(-26, 26)).toBe(0);
        });

        test('plugboardSwap swaps characters correctly', () => {
            const pairs = [
                ['A', 'B'],
                ['C', 'D'],
            ];
            expect(plugboardSwap('A', pairs)).toBe('B');
            expect(plugboardSwap('B', pairs)).toBe('A');
            expect(plugboardSwap('C', pairs)).toBe('D');
            expect(plugboardSwap('D', pairs)).toBe('C');
            expect(plugboardSwap('E', pairs)).toBe('E'); // No swap
        });

        test('plugboardSwap with empty pairs returns original character', () => {
            expect(plugboardSwap('A', [])).toBe('A');
            expect(plugboardSwap('Z', [])).toBe('Z');
        });
    });

    describe('Rotor Class', () => {
        let rotor;

        beforeEach(() => {
            rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
        });

        test('rotor initializes correctly', () => {
            expect(rotor.wiring).toBe(ROTORS[0].wiring);
            expect(rotor.notch).toBe(ROTORS[0].notch);
            expect(rotor.ringSetting).toBe(0);
            expect(rotor.position).toBe(0);
        });

        test('rotor steps correctly', () => {
            expect(rotor.position).toBe(0);
            rotor.step();
            expect(rotor.position).toBe(1);

            // Test wrapping around
            rotor.position = 25;
            rotor.step();
            expect(rotor.position).toBe(0);
        });

        test('rotor detects notch position correctly', () => {
            rotor.position = alphabet.indexOf(rotor.notch);
            expect(rotor.atNotch()).toBe(true);

            rotor.position = (alphabet.indexOf(rotor.notch) + 1) % 26;
            expect(rotor.atNotch()).toBe(false);
        });

        test('rotor forward encoding works', () => {
            const input = 'A';
            const output = rotor.forward(input);
            expect(output).toBe(ROTORS[0].wiring[0]);
        });

        test('rotor backward encoding works', () => {
            const input = ROTORS[0].wiring[0];
            const output = rotor.backward(input);
            expect(output).toBe('A');
        });

        test('rotor with ring setting works correctly', () => {
            const rotorWithRing = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 5, 10);
            const result = rotorWithRing.forward('A');
            expect(typeof result).toBe('string');
            expect(result.length).toBe(1);
        });
    });

    describe('Enigma Machine Core Functionality', () => {
        let enigma;

        beforeEach(() => {
            enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
        });

        test('enigma initializes correctly', () => {
            expect(enigma.rotors).toHaveLength(3);
            expect(enigma.plugboardPairs).toEqual([]);
        });

        test('reciprocal property: encrypting twice returns original', () => {
            const message = 'HELLO';
            const encrypted = enigma.process(message);

            // Reset enigma to same initial state
            enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const decrypted = enigma.process(encrypted);

            expect(decrypted).toBe(message);
        });

        test('encrypts single character correctly', () => {
            const result = enigma.encryptChar('A');
            expect(typeof result).toBe('string');
            expect(result.length).toBe(1);
            expect(alphabet.includes(result)).toBe(true);
        });

        test('non-alphabetic characters pass through unchanged', () => {
            expect(enigma.encryptChar(' ')).toBe(' ');
            expect(enigma.encryptChar('1')).toBe('1');
            expect(enigma.encryptChar('!')).toBe('!');
        });

        test('converts lowercase to uppercase', () => {
            const result = enigma.process('hello');
            expect(result).toMatch(/^[A-Z]+$/);
        });

        test('processes empty string correctly', () => {
            expect(enigma.process('')).toBe('');
        });

        test('processes mixed alphanumeric string correctly', () => {
            const input = 'HELLO123WORLD!';
            const result = enigma.process(input);
            expect(result).toContain('1');
            expect(result).toContain('2');
            expect(result).toContain('3');
            expect(result).toContain('!');
        });
    });

    describe('Plugboard Functionality', () => {
        test('enigma without plugboard works correctly', () => {
            const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const message = 'TEST';
            const encrypted = enigma.process(message);

            // Reset and decrypt
            const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const decrypted = enigma2.process(encrypted);

            expect(decrypted).toBe(message);
        });

        test('enigma with plugboard works correctly', () => {
            const plugboard = [
                ['A', 'B'],
                ['C', 'D'],
            ];
            const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
            const message = 'ABCD';
            const encrypted = enigma.process(message);

            // Reset and decrypt
            const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
            const decrypted = enigma2.process(encrypted);

            expect(decrypted).toBe(message);
        });

        test('different plugboard settings produce different results', () => {
            const message = 'HELLO';

            const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const result1 = enigma1.process(message);

            const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['H', 'X']]);
            const result2 = enigma2.process(message);

            expect(result1).not.toBe(result2);
        });
    });

    describe('Rotor Stepping and Double Stepping', () => {
        test('rightmost rotor steps on each character', () => {
            const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const initialPos = enigma.rotors[2].position;

            enigma.encryptChar('A');
            expect(enigma.rotors[2].position).toBe((initialPos + 1) % 26);

            enigma.encryptChar('B');
            expect(enigma.rotors[2].position).toBe((initialPos + 2) % 26);
        });

        test('middle rotor steps when right rotor hits notch', () => {
            // Set right rotor to its notch position
            const rightNotchPos = alphabet.indexOf(ROTORS[2].notch);
            const enigma = new Enigma([0, 1, 2], [0, 0, rightNotchPos], [0, 0, 0], []);

            const initialMiddlePos = enigma.rotors[1].position;
            enigma.encryptChar('A'); // This should trigger middle rotor step

            expect(enigma.rotors[1].position).toBe((initialMiddlePos + 1) % 26);
        });

        test('double stepping occurs correctly', () => {
            // Set middle rotor to notch position
            const middleNotchPos = alphabet.indexOf(ROTORS[1].notch);
            const enigma = new Enigma([0, 1, 2], [0, middleNotchPos, 0], [0, 0, 0], []);

            const initialLeftPos = enigma.rotors[0].position;
            const initialMiddlePos = enigma.rotors[1].position;

            enigma.encryptChar('A');

            // Both left and middle rotors should have stepped
            expect(enigma.rotors[0].position).toBe((initialLeftPos + 1) % 26);
            expect(enigma.rotors[1].position).toBe((initialMiddlePos + 1) % 26);
        });
    });

    describe('Ring Settings', () => {
        test('different ring settings produce different results', () => {
            const message = 'TEST';

            const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const result1 = enigma1.process(message);

            const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
            const result2 = enigma2.process(message);

            expect(result1).not.toBe(result2);
        });

        test('reciprocal property maintained with ring settings', () => {
            const message = 'ENIGMA';
            const ringSettings = [5, 10, 15];

            const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], ringSettings, []);
            const encrypted = enigma1.process(message);

            const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], ringSettings, []);
            const decrypted = enigma2.process(encrypted);

            expect(decrypted).toBe(message);
        });
    });

    describe('Different Rotor Positions', () => {
        test('different initial positions produce different results', () => {
            const message = 'SECRET';

            const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const result1 = enigma1.process(message);

            const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [0, 0, 0], []);
            const result2 = enigma2.process(message);

            expect(result1).not.toBe(result2);
        });

        test('reciprocal property with different positions', () => {
            const message = 'MESSAGE';
            const positions = [3, 7, 11];

            const enigma1 = new Enigma([0, 1, 2], positions, [0, 0, 0], []);
            const encrypted = enigma1.process(message);

            const enigma2 = new Enigma([0, 1, 2], positions, [0, 0, 0], []);
            const decrypted = enigma2.process(encrypted);

            expect(decrypted).toBe(message);
        });
    });

    describe('Complex Integration Tests', () => {
        test('full configuration encryption/decryption', () => {
            const message = 'THISISASECRETMESSAGE';
            const rotorPositions = [12, 5, 8];
            const ringSettings = [3, 7, 11];
            const plugboard = [
                ['A', 'Z'],
                ['B', 'Y'],
                ['C', 'X'],
            ];

            const enigma1 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboard);
            const encrypted = enigma1.process(message);

            const enigma2 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboard);
            const decrypted = enigma2.process(encrypted);

            expect(decrypted).toBe(message);
            expect(encrypted).not.toBe(message);
        });

        test('long message encryption maintains reciprocal property', () => {
            const longMessage = 'A'.repeat(100);
            const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const encrypted = enigma1.process(longMessage);

            const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const decrypted = enigma2.process(encrypted);

            expect(decrypted).toBe(longMessage);
        });

        test('encryption changes rotors state correctly during long message', () => {
            const enigma = new Enigma([0, 1, 2], [25, 25, 25], [0, 0, 0], []);
            const initialPositions = enigma.rotors.map(r => r.position);

            enigma.process('HELLO');

            const finalPositions = enigma.rotors.map(r => r.position);
            expect(finalPositions).not.toEqual(initialPositions);
        });
    });

    describe('Edge Cases', () => {
        test('handles alphabet boundary conditions', () => {
            const enigma = new Enigma([0, 1, 2], [25, 25, 25], [25, 25, 25], []);
            const result = enigma.process('Z');
            expect(typeof result).toBe('string');
            expect(result.length).toBe(1);
        });

        test('handles maximum plugboard pairs', () => {
            // Create 10 plugboard pairs (maximum realistic)
            const plugboard = [];
            for (let i = 0; i < 10; i++) {
                plugboard.push([alphabet[i * 2], alphabet[i * 2 + 1]]);
            }

            const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
            const result = enigma.process('TEST');
            expect(typeof result).toBe('string');
            expect(result.length).toBe(4);
        });

        test('same character repeated produces different outputs', () => {
            const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
            const result = enigma.process('AAAA');

            // All characters should be different due to rotor stepping
            const chars = result.split('');
            const uniqueChars = [...new Set(chars)];
            expect(uniqueChars.length).toBeGreaterThan(1);
        });
    });
});

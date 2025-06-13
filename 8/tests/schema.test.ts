import Schema from '../src/schema';
import { describe, expect, test } from '@jest/globals';

describe('TypeScript Validation Library', () => {
    // Test Schemas
    const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        postalCode: Schema.string()
            .pattern(/^\d{5}$/)
            .withMessage('Postal code must be 5 digits'),
        country: Schema.string(),
    });

    const userSchema = Schema.object({
        id: Schema.string().withMessage('ID must be a string'),
        name: Schema.string().minLength(2).maxLength(50),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        age: Schema.number().optional(),
        isActive: Schema.boolean(),
        tags: Schema.array(Schema.string()),
        address: addressSchema.optional(),
        metadata: Schema.object({}).optional(),
    });

    // Valid Data Tests
    describe('Valid Data Scenarios', () => {
        test('should validate complete valid user data', () => {
            const validData = {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                tags: ['developer', 'designer'],
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    postalCode: '12345',
                    country: 'USA',
                },
            };
            const result = userSchema.validate(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should validate data with optional fields', () => {
            const validPartialData = {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                tags: ['developer'],
                metadata: {
                    lastLogin: '2024-01-01',
                    visits: 42,
                },
            };
            const result = userSchema.validate(validPartialData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should validate minimum valid data', () => {
            const minimalData = {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                tags: [],
            };
            const result = userSchema.validate(minimalData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    // Invalid Data Tests
    describe('Invalid Data Scenarios', () => {
        test('should reject invalid ID type', () => {
            const invalidData = {
                id: 12345, // should be string
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                tags: [],
            };
            const result = userSchema.validate(invalidData as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('id: Value must be a string');
        });

        test('should reject invalid name length', () => {
            const invalidData = {
                id: '12345',
                name: 'J', // too short
                email: 'john@example.com',
                isActive: true,
                tags: [],
            };
            const result = userSchema.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toMatch(/String must be at least 2 characters long/);
        });

        test('should reject invalid email format', () => {
            const invalidData = {
                id: '12345',
                name: 'John Doe',
                email: 'not-an-email',
                isActive: true,
                tags: [],
            };
            const result = userSchema.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toMatch(/String must match pattern/);
        });

        test('should reject invalid postal code', () => {
            const invalidData = {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                tags: [],
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    postalCode: '123', // invalid
                    country: 'USA',
                },
            };
            const result = userSchema.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Postal code must be 5 digits');
        });

        test('should reject invalid array items', () => {
            const invalidData = {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                tags: ['developer', 123], // invalid item type
            };
            const result = userSchema.validate(invalidData as any);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Item at index 1: Value must be a string');
        });

        test('should reject missing required fields', () => {
            const invalidData = {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                // missing isActive
                tags: [],
            };
            const result = userSchema.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('isActive: Value is required');
        });

        test('should collect multiple validation errors', () => {
            const invalidData = {
                id: 12345, // wrong type
                name: 'J', // too short
                email: 'not-an-email',
                isActive: true,
                tags: ['developer', 123], // invalid item
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    postalCode: '123', // invalid
                    country: 'USA',
                },
            };
            const result = userSchema.validate(invalidData as any);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(3);
            expect(result.errors).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Value must be a string'),
                    expect.stringContaining('String must be at least 2 characters long'),
                    expect.stringContaining('String must match pattern'),
                    expect.stringContaining('Item at index 1: Value must be a string'),
                    expect.stringContaining('Postal code must be 5 digits'),
                ])
            );
        });
    });

    // Individual Validator Tests
    describe('String Validator', () => {
        test('should validate string length constraints', () => {
            const schema = Schema.string().minLength(2).maxLength(5);
            expect(schema.validate('abc').isValid).toBe(true);
            expect(schema.validate('a').isValid).toBe(false);
            expect(schema.validate('123456').isValid).toBe(false);
        });

        test('should validate string patterns', () => {
            const schema = Schema.string().pattern(/^[A-Z]{3}$/);
            expect(schema.validate('ABC').isValid).toBe(true);
            expect(schema.validate('abc').isValid).toBe(false);
            expect(schema.validate('ABCD').isValid).toBe(false);
        });

        test('should validate email format', () => {
            const schema = Schema.string().email();
            expect(schema.validate('test@example.com').isValid).toBe(true);
            expect(schema.validate('invalid-email').isValid).toBe(false);
            expect(schema.validate('test@').isValid).toBe(false);
        });

        test('should validate URL format', () => {
            const schema = Schema.string().url();
            expect(schema.validate('https://example.com').isValid).toBe(true);
            expect(schema.validate('http://sub.example.com/path').isValid).toBe(true);
            expect(schema.validate('not-a-url').isValid).toBe(false);
        });

        test('should validate alphanumeric strings', () => {
            const schema = Schema.string().alphanumeric();
            expect(schema.validate('abc123').isValid).toBe(true);
            expect(schema.validate('abc 123').isValid).toBe(false);
            expect(schema.validate('abc#123').isValid).toBe(false);
        });

        test('should validate string from predefined values', () => {
            const schema = Schema.string().oneOf(['red', 'green', 'blue']);
            expect(schema.validate('red').isValid).toBe(true);
            expect(schema.validate('yellow').isValid).toBe(false);
        });
    });

    describe('Number Validator', () => {
        test('should validate number constraints', () => {
            const schema = Schema.number().minValue(0).maxValue(100);
            expect(schema.validate(50).isValid).toBe(true);
            expect(schema.validate(-1).isValid).toBe(false);
            expect(schema.validate(101).isValid).toBe(false);
        });

        test('should validate optional numbers', () => {
            const schema = Schema.number().optional();
            expect(schema.validate(undefined).isValid).toBe(true);
            expect(schema.validate(42).isValid).toBe(true);
            expect(schema.validate('42' as any).isValid).toBe(false);
        });

        test('should validate positive and negative numbers', () => {
            const positiveSchema = Schema.number().positive();
            expect(positiveSchema.validate(10).isValid).toBe(true);
            expect(positiveSchema.validate(-10).isValid).toBe(false);
            expect(positiveSchema.validate(0).isValid).toBe(false);

            const negativeSchema = Schema.number().negative();
            expect(negativeSchema.validate(-10).isValid).toBe(true);
            expect(negativeSchema.validate(10).isValid).toBe(false);
            expect(negativeSchema.validate(0).isValid).toBe(false);
        });

        test('should validate integer numbers', () => {
            const schema = Schema.number().integer();
            expect(schema.validate(42).isValid).toBe(true);
            expect(schema.validate(42.5).isValid).toBe(false);
        });

        test('should validate number range', () => {
            const schema = Schema.number().range(10, 20);
            expect(schema.validate(15).isValid).toBe(true);
            expect(schema.validate(9).isValid).toBe(false);
            expect(schema.validate(21).isValid).toBe(false);
        });
    });

    describe('Array Validator', () => {
        test('should validate array items', () => {
            const schema = Schema.array(Schema.string());
            expect(schema.validate(['a', 'b', 'c']).isValid).toBe(true);
            expect(schema.validate([1, 2, 3] as any).isValid).toBe(false);
            expect(schema.validate(['a', 1, 'c'] as any).isValid).toBe(false);
        });

        test('should validate array length', () => {
            const schema = Schema.array(Schema.string()).min(1).max(3);
            expect(schema.validate(['a']).isValid).toBe(true);
            expect(schema.validate(['a', 'b', 'c']).isValid).toBe(true);
            expect(schema.validate([]).isValid).toBe(false);
            expect(schema.validate(['a', 'b', 'c', 'd']).isValid).toBe(false);
        });

        test('should validate exact array length', () => {
            const schema = Schema.array(Schema.string()).length(2);
            expect(schema.validate(['a', 'b']).isValid).toBe(true);
            expect(schema.validate(['a']).isValid).toBe(false);
            expect(schema.validate(['a', 'b', 'c']).isValid).toBe(false);
        });
    });

    describe('Boolean Validator', () => {
        test('should validate boolean values', () => {
            const schema = Schema.boolean();
            expect(schema.validate(true).isValid).toBe(true);
            expect(schema.validate(false).isValid).toBe(true);
            expect(schema.validate('true' as any).isValid).toBe(false);
            expect(schema.validate(1 as any).isValid).toBe(false);
        });

        test('should validate required boolean values', () => {
            const schema = Schema.boolean();
            expect(schema.validate(undefined).isValid).toBe(false);
            expect(schema.validate(null).isValid).toBe(false);
        });

        test('should validate optional boolean values', () => {
            const schema = Schema.boolean().optional();
            expect(schema.validate(undefined).isValid).toBe(true);
            expect(schema.validate(null).isValid).toBe(true);
            expect(schema.validate(true).isValid).toBe(true);
            expect(schema.validate(false).isValid).toBe(true);
        });

        test('should validate true-only boolean', () => {
            const schema = Schema.boolean().true();
            expect(schema.validate(true).isValid).toBe(true);
            expect(schema.validate(false).isValid).toBe(false);
        });

        test('should validate false-only boolean', () => {
            const schema = Schema.boolean().false();
            expect(schema.validate(false).isValid).toBe(true);
            expect(schema.validate(true).isValid).toBe(false);
        });
    });

    describe('Custom Validation', () => {
        test('should support custom validation rules', () => {
            const schema = Schema.string().custom(
                value => value.startsWith('test_'),
                'Value must start with test_'
            );
            expect(schema.validate('test_123').isValid).toBe(true);
            expect(schema.validate('123_test').isValid).toBe(false);
        });

        test('should support custom error messages', () => {
            const customMessage = 'Custom error message';
            const schema = Schema.string().minLength(5).withMessage(customMessage);
            const result = schema.validate('abc');
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toBe(customMessage);
        });
    });

    describe('Cross-field Validation', () => {
        test('should validate fields based on other field values', () => {
            const schema = Schema.object({
                password: Schema.string().minLength(8),
                confirmPassword: Schema.string().custom(
                    (value, obj: any) => value === obj.password,
                    'Passwords must match'
                ),
                age: Schema.number(),
                canDrive: Schema.boolean().custom(
                    (value, obj: any) => !value || obj.age >= 16,
                    'Must be at least 16 to drive'
                ),
            });

            // Valid data
            expect(
                schema.validate({
                    password: 'password123',
                    confirmPassword: 'password123',
                    age: 18,
                    canDrive: true,
                }).isValid
            ).toBe(true);

            // Invalid: passwords don't match
            expect(
                schema.validate({
                    password: 'password123',
                    confirmPassword: 'password456',
                    age: 18,
                    canDrive: true,
                }).isValid
            ).toBe(false);

            // Invalid: too young to drive
            expect(
                schema.validate({
                    password: 'password123',
                    confirmPassword: 'password123',
                    age: 15,
                    canDrive: true,
                }).isValid
            ).toBe(false);
        });
    });

    describe('Error Messages', () => {
        test('should provide descriptive error messages', () => {
            const schema = Schema.object({
                username: Schema.string()
                    .minLength(3)
                    .withMessage('Username must be at least 3 characters'),
                age: Schema.number().minValue(18).withMessage('Must be 18 or older'),
            });

            const result = schema.validate({
                username: 'ab',
                age: 16,
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('username: Username must be at least 3 characters');
            expect(result.errors).toContain('age: Must be 18 or older');
        });

        test('should handle multiple validation errors', () => {
            const schema = Schema.string()
                .minLength(8)
                .pattern(/[A-Z]/)
                .pattern(/[0-9]/)
                .withMessage(
                    'Password must be at least 8 characters and contain uppercase letter and number'
                );

            const result = schema.validate('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toBe(
                'Password must be at least 8 characters and contain uppercase letter and number'
            );
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle undefined values in non-optional validators', () => {
            const stringSchema = Schema.string();
            const numberSchema = Schema.number();
            const booleanSchema = Schema.boolean();
            const arraySchema = Schema.array(Schema.string());

            expect(stringSchema.validate(undefined).isValid).toBe(false);
            expect(numberSchema.validate(undefined).isValid).toBe(false);
            expect(booleanSchema.validate(undefined).isValid).toBe(false);
            expect(arraySchema.validate(undefined).isValid).toBe(false);
        });

        test('should handle null values in non-optional validators', () => {
            const stringSchema = Schema.string();
            const numberSchema = Schema.number();
            const booleanSchema = Schema.boolean();
            const arraySchema = Schema.array(Schema.string());

            expect(stringSchema.validate(null).isValid).toBe(false);
            expect(numberSchema.validate(null).isValid).toBe(false);
            expect(booleanSchema.validate(null).isValid).toBe(false);
            expect(arraySchema.validate(null).isValid).toBe(false);
        });

        test('should handle invalid types in validators', () => {
            const stringSchema = Schema.string();
            const numberSchema = Schema.number();
            const booleanSchema = Schema.boolean();
            const arraySchema = Schema.array(Schema.string());

            expect(stringSchema.validate(123 as any).isValid).toBe(false);
            expect(numberSchema.validate('123' as any).isValid).toBe(false);
            expect(booleanSchema.validate('true' as any).isValid).toBe(false);
            expect(arraySchema.validate({} as any).isValid).toBe(false);
        });

        test('should validate nested arrays', () => {
            const schema = Schema.array(Schema.array(Schema.number()));

            expect(
                schema.validate([
                    [1, 2],
                    [3, 4],
                ]).isValid
            ).toBe(true);
            expect(
                schema.validate([
                    [1, '2'],
                    [3, 4],
                ] as any).isValid
            ).toBe(false);
            expect(schema.validate([1, [2, 3]] as any).isValid).toBe(false);
        });

        test('should validate deeply nested objects', () => {
            const schema = Schema.object({
                user: Schema.object({
                    profile: Schema.object({
                        name: Schema.string(),
                        settings: Schema.object({
                            theme: Schema.string().oneOf(['light', 'dark']),
                            notifications: Schema.boolean(),
                        }),
                    }),
                }),
            });

            expect(
                schema.validate({
                    user: {
                        profile: {
                            name: 'John',
                            settings: {
                                theme: 'dark',
                                notifications: true,
                            },
                        },
                    },
                }).isValid
            ).toBe(true);

            expect(
                schema.validate({
                    user: {
                        profile: {
                            name: 'John',
                            settings: {
                                theme: 'blue', // invalid theme
                                notifications: true,
                            },
                        },
                    },
                }).isValid
            ).toBe(false);
        });

        test('should handle circular references in objects', () => {
            const schema = Schema.object({
                name: Schema.string(),
                child: Schema.object({
                    name: Schema.string(),
                    parent: Schema.object({}), // circular reference
                }),
            });

            const validData = {
                name: 'Parent',
                child: {
                    name: 'Child',
                    parent: {}, // empty object is valid
                },
            };

            expect(schema.validate(validData).isValid).toBe(true);
        });

        test('should validate array with mixed validators', () => {
            const schema = Schema.object({
                mixed: Schema.array(Schema.string().oneOf(['type1', 'type2'])).custom(
                    value => value.includes('type1'), // must contain type1
                    'Array must contain type1'
                ),
            });

            expect(
                schema.validate({
                    mixed: ['type1', 'type2'],
                }).isValid
            ).toBe(true);

            expect(
                schema.validate({
                    mixed: ['type2', 'type2'],
                }).isValid
            ).toBe(false);
        });
    });

    describe('Date Validator', () => {
        let pastDate: Date;
        let futureDate: Date;
        let currentDate: Date;

        beforeEach(() => {
            // Set up fixed dates for testing
            currentDate = new Date('2024-01-01T12:00:00Z');
            pastDate = new Date('2023-01-01T12:00:00Z');
            futureDate = new Date('2025-01-01T12:00:00Z');

            // Mock Date.now() to return a fixed timestamp
            jest.spyOn(Date, 'now').mockImplementation(() => currentDate.getTime());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should validate basic date type', () => {
            const schema = Schema.date();

            // Valid dates
            expect(schema.validate(new Date())).toEqual({ isValid: true, errors: [] });
            expect(schema.validate(new Date('2024-01-01'))).toEqual({ isValid: true, errors: [] });

            // Invalid dates
            expect(schema.validate('2024-01-01' as any)).toEqual({
                isValid: false,
                errors: ['Value must be a valid date'],
            });
            expect(schema.validate(new Date('invalid'))).toEqual({
                isValid: false,
                errors: ['Value must be a valid date'],
            });
            expect(schema.validate(null as any)).toEqual({
                isValid: false,
                errors: ['Value is required'], // Base validator handles null values
            });
        });

        test('should validate dates before a specified date', () => {
            const schema = Schema.date().before(currentDate);

            expect(schema.validate(pastDate).isValid).toBe(true);
            expect(schema.validate(futureDate).isValid).toBe(false);
            expect(schema.validate(currentDate).isValid).toBe(false);
        });

        test('should validate dates after a specified date', () => {
            const schema = Schema.date().after(currentDate);

            expect(schema.validate(futureDate).isValid).toBe(true);
            expect(schema.validate(pastDate).isValid).toBe(false);
            expect(schema.validate(currentDate).isValid).toBe(false);
        });

        test('should validate dates in the past', () => {
            const schema = Schema.date().past();

            expect(schema.validate(pastDate).isValid).toBe(true);
            expect(schema.validate(futureDate).isValid).toBe(false);
            expect(schema.validate(currentDate).isValid).toBe(false);
        });

        test('should validate dates in the future', () => {
            const schema = Schema.date().future();

            expect(schema.validate(futureDate).isValid).toBe(true);
            expect(schema.validate(pastDate).isValid).toBe(false);
            expect(schema.validate(currentDate).isValid).toBe(false);
        });

        test('should validate dates between two dates', () => {
            const schema = Schema.date().between(pastDate, futureDate);

            expect(schema.validate(currentDate).isValid).toBe(true);
            expect(schema.validate(pastDate).isValid).toBe(true);
            expect(schema.validate(futureDate).isValid).toBe(true);

            const beforeRange = new Date('2022-01-01');
            const afterRange = new Date('2026-01-01');
            expect(schema.validate(beforeRange).isValid).toBe(false);
            expect(schema.validate(afterRange).isValid).toBe(false);
        });

        test('should validate date format', () => {
            // Test ISO date format YYYY-MM-DD
            const schema = Schema.date().format(/^\d{4}-\d{2}-\d{2}/, 'YYYY-MM-DD');

            const validDate = new Date('2024-01-01');
            expect(schema.validate(validDate).isValid).toBe(true);
        });

        test('should handle optional dates', () => {
            const schema = Schema.date().optional();

            expect(schema.validate(undefined).isValid).toBe(true);
            expect(schema.validate(null).isValid).toBe(true); // null should be treated like undefined for optional fields
            expect(schema.validate(new Date()).isValid).toBe(true);
        });

        test('should combine multiple date validations', () => {
            const schema = Schema.date()
                .after(pastDate)
                .before(futureDate)
                .format(/^\d{4}-\d{2}-\d{2}/, 'YYYY-MM-DD');

            expect(schema.validate(currentDate).isValid).toBe(true);
            expect(schema.validate(pastDate).isValid).toBe(false);
            expect(schema.validate(futureDate).isValid).toBe(false);
        });

        test('should provide descriptive error messages', () => {
            const schema = Schema.date()
                .after(currentDate)
                .withMessage('Date must be after current date');

            const result = schema.validate(pastDate);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toBe('Date must be after current date');
        });
    });
});

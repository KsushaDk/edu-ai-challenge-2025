import { BaseValidator } from './base';
import { ValidationResult } from '../types/validator';

/**
 * Validator for number values
 */
export class NumberValidator extends BaseValidator<number> {
    constructor() {
        super();
        // Add base type validation
        this.validations.push(value => ({
            isValid: typeof value === 'number' && !isNaN(value),
            error: 'Value must be a valid number',
        }));
    }

    // Validate minimum value (inclusive)
    minValue(min: number): this {
        this.validations.push(value => ({
            isValid: (value as number) >= min,
            error: `Value must be greater than or equal to ${min}`,
        }));
        return this;
    }

    // Validate maximum value (inclusive)
    maxValue(max: number): this {
        this.validations.push(value => ({
            isValid: (value as number) <= max,
            error: `Value must be less than or equal to ${max}`,
        }));
        return this;
    }

    // Validate value is positive (greater than 0)
    positive(): this {
        this.validations.push(value => ({
            isValid: (value as number) > 0,
            error: 'Value must be positive (greater than 0)',
        }));
        return this;
    }

    // Validate value is negative (less than 0)
    negative(): this {
        this.validations.push(value => ({
            isValid: (value as number) < 0,
            error: 'Value must be negative (less than 0)',
        }));
        return this;
    }

    // Validate value is an integer
    integer(): this {
        this.validations.push(value => ({
            isValid: Number.isInteger(value as number),
            error: 'Value must be an integer',
        }));
        return this;
    }

    // Validate value is within a range (inclusive)
    range(min: number, max: number): this {
        this.minValue(min);
        this.maxValue(max);
        return this;
    }

    protected validateType(value: unknown): ValidationResult {
        // Basic number type validation
        if (typeof value !== 'number' || isNaN(value)) {
            return {
                isValid: false,
                errors: ['Value must be a valid number'],
            };
        }
        return {
            isValid: true,
            errors: [],
        };
    }
}

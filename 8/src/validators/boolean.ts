import { BaseValidator } from './base';
import { ValidationResult } from '../types/validator';

/**
 * Validator for boolean values
 */
export class BooleanValidator extends BaseValidator<boolean> {
    constructor() {
        super();
        // Add base type validation
        this.validations.push(value => ({
            isValid: typeof value === 'boolean',
            error: 'Value must be a boolean',
        }));
    }

    // Validate value is true
    true(): this {
        this.validations.push(value => ({
            isValid: value === true,
            error: 'Value must be true',
        }));
        return this;
    }

    // Validate value is false
    false(): this {
        this.validations.push(value => ({
            isValid: value === false,
            error: 'Value must be false',
        }));
        return this;
    }

    // Validate value equals another field's value
    equals(fieldName: string): this {
        this.validations.push((value, parentObj) => ({
            isValid: value === (parentObj as any)?.[fieldName],
            error: `Value must equal the value of field '${fieldName}'`,
        }));
        return this;
    }

    protected validateType(value: unknown): ValidationResult {
        // Basic boolean type validation
        if (typeof value !== 'boolean') {
            return {
                isValid: false,
                errors: ['Value must be a boolean'],
            };
        }
        return {
            isValid: true,
            errors: [],
        };
    }
}

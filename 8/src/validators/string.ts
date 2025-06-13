import { BaseValidator } from './base';
import { ValidationResult } from '../types/validator';

/**
 * Validator for string values
 */
export class StringValidator extends BaseValidator<string> {
    constructor() {
        super();
        // Add base type validation
        this.validations.push(value => ({
            isValid: typeof value === 'string',
            error: 'Value must be a string',
        }));
    }

    // Validate minimum string length
    minLength(length: number): this {
        this.validations.push(value => ({
            isValid: (value as string).length >= length,
            error: `String must be at least ${length} characters long`,
        }));
        return this;
    }

    // Validate maximum string length
    maxLength(length: number): this {
        this.validations.push(value => ({
            isValid: (value as string).length <= length,
            error: `String must be at most ${length} characters long`,
        }));
        return this;
    }

    // Validate exact string length
    length(exactLength: number): this {
        this.validations.push(value => ({
            isValid: (value as string).length === exactLength,
            error: `String must be exactly ${exactLength} characters long`,
        }));
        return this;
    }

    // Validate string matches a regex pattern
    pattern(regex: RegExp): this {
        this.validations.push(value => ({
            isValid: regex.test(value as string),
            error: `String must match pattern ${regex}`,
        }));
        return this;
    }

    // Validate string is a valid email format
    email(): this {
        // Basic email validation pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return this.pattern(emailPattern).withMessage('Must be a valid email address');
    }

    // Validate string is a valid URL format
    url(): this {
        // Basic URL validation pattern
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return this.pattern(urlPattern).withMessage('Must be a valid URL');
    }

    // Validate string contains only alphanumeric characters
    alphanumeric(): this {
        return this.pattern(/^[a-zA-Z0-9]+$/).withMessage(
            'String must contain only letters and numbers'
        );
    }

    // Validate string is one of the allowed values
    oneOf(allowedValues: string[]): this {
        this.validations.push(value => ({
            isValid: allowedValues.includes(value as string),
            error: `Value must be one of: ${allowedValues.join(', ')}`,
        }));
        return this;
    }

    protected validateType(value: unknown): ValidationResult {
        // Basic string type validation
        if (typeof value !== 'string') {
            return {
                isValid: false,
                errors: ['Value must be a string'],
            };
        }
        return {
            isValid: true,
            errors: [],
        };
    }
}

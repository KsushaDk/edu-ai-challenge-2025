import { BaseValidator } from './base';
import { ValidationResult } from '../types/validator';

/**
 * Validator for Date values
 */
export class DateValidator extends BaseValidator<Date> {
    constructor() {
        super();
        // Add base type validation
        this.validations.push(value => ({
            isValid: value instanceof Date && !isNaN(value.getTime()),
            error: 'Value must be a valid date',
        }));
    }

    // Validate date is after specified date
    after(date: Date): this {
        this.validations.push(value => ({
            isValid: (value as Date).getTime() > date.getTime(),
            error: `Date must be after ${date.toISOString()}`,
        }));
        return this;
    }

    // Validate date is before specified date
    before(date: Date): this {
        this.validations.push(value => ({
            isValid: (value as Date).getTime() < date.getTime(),
            error: `Date must be before ${date.toISOString()}`,
        }));
        return this;
    }

    // Validate date is in the past
    past(): this {
        this.validations.push(value => ({
            isValid: (value as Date).getTime() < Date.now(),
            error: 'Date must be in the past',
        }));
        return this;
    }

    // Validate date is in the future
    future(): this {
        this.validations.push(value => ({
            isValid: (value as Date).getTime() > Date.now(),
            error: 'Date must be in the future',
        }));
        return this;
    }

    // Validate date is between two dates (inclusive)
    between(start: Date, end: Date): this {
        this.validations.push(value => ({
            isValid:
                (value as Date).getTime() >= start.getTime() &&
                (value as Date).getTime() <= end.getTime(),
            error: `Date must be between ${start.toISOString()} and ${end.toISOString()}`,
        }));
        return this;
    }

    format(formatRegex: RegExp, formatDescription: string): this {
        this.validations.push(value => ({
            isValid: formatRegex.test((value as Date).toISOString()),
            error: `Date must be in ${formatDescription} format`,
        }));
        return this;
    }

    protected validateType(value: unknown): ValidationResult {
        // Basic date type validation
        if (!(value instanceof Date) || isNaN(value.getTime())) {
            return {
                isValid: false,
                errors: ['Value must be a valid date'],
            };
        }
        return {
            isValid: true,
            errors: [],
        };
    }
}

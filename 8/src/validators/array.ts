import { BaseValidator } from './base';
import { IValidator, ValidationResult } from '../types/validator';

/**
 * Validator for array values with type safety for array items
 * T represents the type of items in the array
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
    // Validator for individual array items
    private itemValidator: IValidator<T>;
    // Minimum length constraint (if set)
    private minLength: number | null = null;
    // Maximum length constraint (if set)
    private maxLength: number | null = null;

    /**
     * Creates a new array validator with a specific item validator
     * @param itemValidator - Validator to use for each array item
     */
    constructor(itemValidator: IValidator<T>) {
        super();
        this.itemValidator = itemValidator;
        // Add basic array type validation
        this.validations.push(value => ({
            isValid: Array.isArray(value),
            error: 'Value must be an array',
        }));
    }

    /**
     * Sets minimum length requirement for the array
     * Example: Schema.array(Schema.string()).min(2) // Array must have at least 2 items
     */
    min(length: number): this {
        this.validations.push(value => ({
            isValid: (value as T[]).length >= length,
            error: `Array must contain at least ${length} items`,
        }));
        this.minLength = length;
        return this;
    }

    /**
     * Sets maximum length requirement for the array
     * Example: Schema.array(Schema.string()).max(5) // Array must have at most 5 items
     */
    max(length: number): this {
        this.validations.push(value => ({
            isValid: (value as T[]).length <= length,
            error: `Array must contain at most ${length} items`,
        }));
        this.maxLength = length;
        return this;
    }

    /**
     * Sets exact length requirement for the array
     * Example: Schema.array(Schema.string()).length(3) // Array must have exactly 3 items
     */
    length(exactLength: number): this {
        this.validations.push(value => ({
            isValid: (value as T[]).length === exactLength,
            error: `Array must contain exactly ${exactLength} items`,
        }));
        this.minLength = exactLength;
        this.maxLength = exactLength;
        return this;
    }

    /**
     * Internal type validation method
     * Checks if the value is actually an array before running other validations
     */
    protected validateType(value: unknown): ValidationResult {
        if (!Array.isArray(value)) {
            return { isValid: false, errors: ['Value must be an array'] };
        }
        return { isValid: true, errors: [] };
    }

    /**
     * Main validation method that:
     * 1. Checks if value is defined (unless optional)
     * 2. Runs base validations (type check and length constraints)
     * 3. Validates each array item using the itemValidator
     *
     * Example usage:
     * const arraySchema = Schema.array(Schema.string()).min(1).max(3);
     * arraySchema.validate(['a', 'b']); // Valid
     * arraySchema.validate(['a', 123]); // Invalid: second item not a string
     * arraySchema.validate([]); // Invalid: too few items
     */
    validate(value: unknown, parentObj: unknown = {}): ValidationResult {
        // Handle undefined values for optional arrays
        if (value === undefined) {
            return {
                isValid: this.isOptional,
                errors: this.isOptional ? [] : ['Value is required'],
            };
        }

        // Run base validations (type check and length constraints)
        const baseResult = super.validate(value, parentObj);
        if (!baseResult.isValid) {
            return baseResult;
        }

        const errors: string[] = [];
        const arrayValue = value as T[];

        // Validate each item in the array using the itemValidator
        for (let i = 0; i < arrayValue.length; i++) {
            const itemResult = this.itemValidator.validate(arrayValue[i], parentObj);
            if (!itemResult.isValid) {
                // Prefix item errors with array index for better error messages
                errors.push(`Item at index ${i}: ${itemResult.errors.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

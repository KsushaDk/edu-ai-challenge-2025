import { IValidator, ValidationResult } from '../types/validator';

/**
 * Base validator class that implements common validation functionality
 */
export abstract class BaseValidator<T> implements IValidator<T> {
    protected validations: Array<
        (value: unknown, parentObj?: unknown) => { isValid: boolean; error: string }
    >;
    protected isOptional: boolean;
    protected customMessage: string;

    constructor() {
        this.validations = [];
        this.isOptional = false;
        this.customMessage = '';
    }

    optional(): this {
        this.isOptional = true;
        return this;
    }

    withMessage(message: string): this {
        this.customMessage = message;
        return this;
    }

    custom(validationFn: (value: T, parentObj?: unknown) => boolean, errorMessage: string): this {
        // Wrap the custom validation function to handle type conversion and error formatting
        this.validations.push((value, parentObj) => {
            const typedValue = value as T; // Cast to expected type for type safety
            return {
                isValid: validationFn(typedValue, parentObj),
                error: errorMessage,
            };
        });
        return this;
    }

    validate(value: unknown, parentObj: unknown = {}): ValidationResult {
        // Handle optional fields first - if optional and null/undefined, validation passes
        if (value === undefined || value === null) {
            return {
                isValid: this.isOptional,
                errors: this.isOptional ? [] : ['Value is required'],
            };
        }

        // Run type-specific validation first (implemented by child classes)
        const typeValidation = this.validateType(value);
        if (!typeValidation.isValid) {
            return typeValidation;
        }

        // Run all custom validations in sequence
        const errors: string[] = [];
        for (const validation of this.validations) {
            // Each validation returns {isValid, error}
            const result = validation(value, parentObj);
            if (!result.isValid) {
                // Use custom message if set, otherwise use validation-specific error
                errors.push(this.customMessage || result.error);
            }
        }

        // Return final result - valid only if no errors were collected
        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    // Abstract method that each specific validator must implement
    protected abstract validateType(value: unknown): ValidationResult;
}

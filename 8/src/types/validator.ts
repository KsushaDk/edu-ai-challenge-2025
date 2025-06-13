/**
 * Represents the result of a validation operation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Base validator interface that all validators must implement
 */
export interface IValidator<T> {
    validate(value: unknown, parentObj?: unknown): ValidationResult;
    optional(): this;
    withMessage(message: string): this;
    custom(validationFn: (value: T, parentObj?: unknown) => boolean, errorMessage: string): this;
}

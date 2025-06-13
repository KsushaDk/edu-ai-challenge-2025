import { BaseValidator } from './base';
import { IValidator, ValidationResult } from '../types/validator';

/**
 * Validator for object values
 */
export class ObjectValidator<T> extends BaseValidator<T> {
    private schema: Record<keyof T, IValidator<unknown>>;

    constructor(schema: Record<keyof T, IValidator<unknown>>) {
        super();
        this.schema = schema;
        // Add base type validation to ensure we have a non-array object
        this.validations.push(value => ({
            isValid:
                value === undefined ||
                (Boolean(value) && typeof value === 'object' && !Array.isArray(value)),
            error: 'Value must be an object',
        }));
    }

    protected validateType(value: unknown): ValidationResult {
        const isValidType = Boolean(value) && typeof value === 'object' && !Array.isArray(value);
        return {
            isValid: isValidType,
            errors: isValidType ? [] : ['Value must be an object'],
        };
    }

    validate(value: unknown, parentObj: unknown = {}): ValidationResult {
        // Handle undefined for optional validators first
        if (value === undefined) {
            return {
                isValid: this.isOptional,
                errors: this.isOptional ? [] : ['Value is required'],
            };
        }

        // Run base validations (type check and custom validations)
        const baseResult = super.validate(value, parentObj);
        if (!baseResult.isValid) {
            return baseResult;
        }

        const errors: string[] = [];
        const objValue = value as T;

        // Validate each field using its corresponding validator
        for (const [key, validator] of Object.entries(this.schema) as [
            keyof T,
            IValidator<unknown>
        ][]) {
            const fieldValue = objValue[key];

            // Skip validation for undefined fields if validator is optional
            if (fieldValue === undefined) {
                if ((validator as any).isOptional) {
                    continue;
                }
                errors.push(`${String(key)}: Value is required`);
                continue;
            }

            // Run the field's validator, passing the whole object for cross-field validation
            const fieldResult = validator.validate(fieldValue, objValue);
            if (!fieldResult.isValid) {
                // Prefix field name to error messages for clarity
                errors.push(`${String(key)}: ${fieldResult.errors.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

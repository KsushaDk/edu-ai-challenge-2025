import { StringValidator } from './validators/string';
import { NumberValidator } from './validators/number';
import { BooleanValidator } from './validators/boolean';
import { DateValidator } from './validators/date';
import { ArrayValidator } from './validators/array';
import { ObjectValidator } from './validators/object';
import { IValidator } from './types/validator';

/**
 * Schema Builder class for creating validators
 */
class Schema {
    static string(): StringValidator {
        return new StringValidator();
    }

    static number(): NumberValidator {
        return new NumberValidator();
    }

    static boolean(): BooleanValidator {
        return new BooleanValidator();
    }

    static date(): DateValidator {
        return new DateValidator();
    }

    static array<T>(itemValidator: IValidator<T>): ArrayValidator<T> {
        return new ArrayValidator<T>(itemValidator);
    }

    static object<T extends Record<string, any>>(
        schema: Record<keyof T, IValidator<any>>
    ): ObjectValidator<T> {
        return new ObjectValidator<T>(schema);
    }
}

// Export Schema as default
export default Schema;

// Export types and interfaces
export { ValidationResult, IValidator } from './types/validator';
export { StringValidator } from './validators/string';
export { NumberValidator } from './validators/number';
export { BooleanValidator } from './validators/boolean';
export { DateValidator } from './validators/date';
export { ArrayValidator } from './validators/array';
export { ObjectValidator } from './validators/object';

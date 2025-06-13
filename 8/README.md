# TypeScript Validation Library

A robust, type-safe validation library for TypeScript applications. This library provides a fluent API for creating and composing validation schemas for complex data structures.

## Project Structure

```
.
├── src/                    # Source code
│   ├── types/        # TypeScript types
│   ├── validators/       # Individual validators
│   └── schema.ts        # Main schema builder
├── examples/             # Example usage
│   ├── original-examples.ts   # Original schema.js compatibility examples
│   └── extended-examples.ts   # Extended functionality examples
├── tests/               # Test files
├── dist/                # Compiled JavaScript (after build)
├── package.json        # Project configuration
├── tsconfig.json      # TypeScript configuration
└── jest.config.js    # Jest test configuration
```

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Available npm scripts

```bash
npm run build          # Build the project (generates files in dist/)
npm run test          # Run tests
npm run test:coverage # Run tests with coverage report
npm run test:watch    # Run tests in watch mode
npm run clean         # Clean build artifacts
```

## Examples

The library includes two example files demonstrating different validation scenarios:

### 1. Original Schema.js Examples (`examples/original-examples.ts`)

```bash
npx ts-node examples/original-examples.ts
```

Demonstrates compatibility with schema.js API:

-   Basic type validation
-   String pattern matching
-   Nested object validation
-   Array validation
-   Optional fields
-   Custom error messages

### 2. Extended Examples (`examples/extended-examples.ts`)

```bash
npx ts-node examples/extended-examples.ts
```

Showcases advanced validation features:

1. Complex Nested Objects

```typescript
interface User {
    name: string;
    contact?: {
        email: string;
        phone?: string;
    };
    preferences?: {
        theme: 'light' | 'dark';
        notifications: boolean;
    };
}
```

2. Phone Number Validation

```typescript
const phoneSchema = Schema.object<PhoneNumber>({
    countryCode: Schema.string().pattern(/^\+\d{1,3}$/),
    number: Schema.string().pattern(/^\d{10}$/),
    extension: Schema.string()
        .pattern(/^\d{1,4}$/)
        .optional(),
});
```

3. Date Validation

```typescript
const eventSchema = Schema.object<Event>({
    title: Schema.string(),
    startDate: Schema.date(),
    endDate: Schema.date(),
    registrationDeadline: Schema.date(),
});
```

4. Type-Safe Enums

```typescript
interface Subscription {
    type: 'free' | 'premium' | 'enterprise';
    paymentMethod?: string;
    features: string[];
}
```

Key Features Demonstrated:

-   Type-safe validation with TypeScript interfaces
-   Complex nested object structures
-   Optional fields with validation
-   Pattern matching with regular expressions
-   Date validation
-   Enum validation
-   Array validation with custom rules
-   Comprehensive error messages
-   Validation of required fields in optional objects

## Available Validators

### String Validator

```typescript
Schema.string()
    .minLength(n) // Minimum length
    .maxLength(n) // Maximum length
    .pattern(regex) // Regular expression matching
    .email() // Email format
    .url() // URL format
    .alphanumeric() // Letters and numbers only
    .oneOf(values); // Must match one of values
```

### Number Validator

```typescript
Schema.number()
    .minValue(n) // Minimum value
    .maxValue(n) // Maximum value
    .positive() // Must be positive
    .negative() // Must be negative
    .integer() // Must be integer
    .range(min, max); // Must be within range
```

### Boolean Validator

```typescript
Schema.boolean()
    .true() // Must be true
    .false(); // Must be false
```

### Array Validator

```typescript
Schema.array(itemValidator)
    .minLength(n) // Minimum array length
    .maxLength(n) // Maximum array length
    .length(n); // Exact array length
```

### Object Validator

```typescript
Schema.object({
    field: validator, // Field validation
    optional: Schema.string().optional(), // Optional field
});
```

### Date Validator

```typescript
Schema.date()
    .before(date) // Must be before date
    .after(date) // Must be after date
    .future() // Must be in the future
    .past(); // Must be in the past
```

## Core Improvements Over schema.js:

1. **Type Safety**

    - Full TypeScript support with type inference
    - Generic type constraints
    - Strict type checking for nested objects

2. **Error Handling**

    - Detailed error messages with field paths
    - Multiple error collection
    - Structured error format

3. **Validation Features**

    - Built-in email and URL validation
    - Alphanumeric validation
    - Integer validation
    - Positive/negative number validation
    - Range validation
    - Cross-field validation
    - Date validation with relative constraints

4. **Architecture**

    - Modular validator classes
    - Clear separation of concerns
    - Better maintainability
    - Proper TypeScript declarations

5. **Developer Experience**
    - Fluent API
    - Enhanced IDE support
    - Intuitive nested validation
    - Comprehensive error messages

## Test Coverage

Current coverage metrics:

-   Statements: 96.15%
-   Branches: 87.50%
-   Functions: 88.37%
-   Lines: 96.53%

View detailed coverage report (test_report.txt):

```bash
npm run test:coverage
```

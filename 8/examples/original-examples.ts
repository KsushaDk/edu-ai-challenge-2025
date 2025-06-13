import Schema from '../src/schema';

// Define interfaces for type safety
interface Address {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
    isActive: boolean;
    tags: string[];
    address?: Address;
    metadata?: Record<string, unknown>;
}

console.log('\n=== Testing Original Schema.js Data ===\n');

// Define schemas exactly as in schema.js
const addressValidators = {
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string()
        .pattern(/^\d{5}$/)
        .withMessage('Postal code must be 5 digits'),
    country: Schema.string(),
};

const userSchema = Schema.object<User>({
    id: Schema.string().withMessage('ID must be a string'),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.number().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: Schema.object<Address>(addressValidators).optional(),
    metadata: Schema.object<Record<string, unknown>>({}).optional(),
});

// Test with the exact same valid data
const validUserData = {
    id: '12345',
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true,
    tags: ['developer', 'designer'],
    address: {
        street: '123 Main St',
        city: 'Anytown',
        postalCode: '12345',
        country: 'USA',
    },
};

console.log('Testing Valid Data:');
console.log('Input:', JSON.stringify(validUserData, null, 2));
console.log('Result:', userSchema.validate(validUserData));

// Test with various invalid data
console.log('\nTesting Invalid Cases:');

// Case 1: Invalid ID type
const invalidId = {
    ...validUserData,
    id: 12345, // should be string
} as any;
console.log('\nCase 1 - Invalid ID type:');
console.log('Result:', userSchema.validate(invalidId));

// Case 2: Invalid name length
const invalidName = {
    ...validUserData,
    name: 'J', // too short
};
console.log('\nCase 2 - Invalid name length:');
console.log('Result:', userSchema.validate(invalidName));

// Case 3: Invalid email format
const invalidEmail = {
    ...validUserData,
    email: 'not-an-email',
};
console.log('\nCase 3 - Invalid email format:');
console.log('Result:', userSchema.validate(invalidEmail));

// Case 4: Invalid postal code
const invalidPostal = {
    ...validUserData,
    address: {
        ...validUserData.address!,
        postalCode: '123', // not 5 digits
    },
};
console.log('\nCase 4 - Invalid postal code:');
console.log('Result:', userSchema.validate(invalidPostal));

// Case 5: Invalid tags type
const invalidTags = {
    ...validUserData,
    tags: ['developer', 123], // should be all strings
} as any;
console.log('\nCase 5 - Invalid tags type:');
console.log('Result:', userSchema.validate(invalidTags));

// Case 6: Missing required field
const missingRequired = {
    ...validUserData,
    isActive: undefined, // required field
} as any;
console.log('\nCase 6 - Missing required field:');
console.log('Result:', userSchema.validate(missingRequired));

// Case 7: With optional metadata
const withMetadata = {
    ...validUserData,
    metadata: {
        lastLogin: '2024-01-01',
        visits: 42,
    },
};
console.log('\nCase 7 - With optional metadata:');
console.log('Result:', userSchema.validate(withMetadata));

import Schema from '../src/schema';

console.log('\n=== Testing Extended Functionality ===');

// Extended functionality with more complex nested objects
interface User {
    name: string;
    age: number;
    isActive: boolean;
    contact?: {
        email: string;
        phone?: string;
    };
    preferences?: {
        theme: string;
        notifications: boolean;
    };
}

const userSchema = Schema.object<User>({
    name: Schema.string().minLength(2),
    age: Schema.number().minValue(18),
    isActive: Schema.boolean(),
    contact: Schema.object<Required<User>['contact']>({
        email: Schema.string().email(),
        phone: Schema.string()
            .pattern(/^\+?[\d\s-]{10,}$/)
            .optional(),
    }).optional(),
    preferences: Schema.object<Required<User>['preferences']>({
        theme: Schema.string().pattern(/^(light|dark)$/),
        notifications: Schema.boolean(),
    }).optional(),
});

// Test cases
console.log('\nValid User (Full Data):');
const validUserFull = {
    name: 'John Doe',
    age: 30,
    isActive: true,
    contact: {
        email: 'john@example.com',
        phone: '+1-555-123-4567',
    },
    preferences: {
        theme: 'dark',
        notifications: true,
    },
};
console.log(userSchema.validate(validUserFull));

console.log('\nValid User (Minimal Data):');
const validUserMinimal = {
    name: 'Jane Smith',
    age: 25,
    isActive: false,
};
console.log(userSchema.validate(validUserMinimal));

console.log('\nInvalid User (Complex Validation):');
const invalidUser = {
    name: 'J', // Too short
    age: 15, // Too young
    isActive: 'yes', // Wrong type
    contact: {
        email: 'not-an-email', // Invalid email
        phone: '123', // Invalid phone format
    },
    preferences: {
        theme: 'blue', // Invalid theme
        notifications: 'yes', // Wrong type
    },
} as any;
console.log(userSchema.validate(invalidUser));

console.log('\nInvalid User (Nested Required Fields):');
const invalidPartialUser = {
    name: 'Alice Johnson',
    age: 28,
    isActive: true,
    contact: {
        // Missing required email
        phone: '+1-555-123-4567',
    },
    preferences: {
        theme: 'light',
        // Missing required notifications
    },
} as any;
console.log(userSchema.validate(invalidPartialUser));

// Additional advanced validation examples
console.log('\nTesting Advanced Features:');

// 1. Complex phone number validation
interface PhoneNumber {
    countryCode: string;
    number: string;
    extension?: string;
}

const phoneSchema = Schema.object<PhoneNumber>({
    countryCode: Schema.string().pattern(/^\+\d{1,3}$/),
    number: Schema.string().pattern(/^\d{10}$/),
    extension: Schema.string()
        .pattern(/^\d{1,4}$/)
        .optional(),
});

// 2. Date range validation
interface Event {
    title: string;
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date;
}

const eventSchema = Schema.object<Event>({
    title: Schema.string(),
    startDate: Schema.date(),
    endDate: Schema.date(),
    registrationDeadline: Schema.date(),
});

// 3. Conditional validation
interface Subscription {
    type: 'free' | 'premium' | 'enterprise';
    paymentMethod?: string;
    features: string[];
}

const subscriptionSchema = Schema.object<Subscription>({
    type: Schema.string().oneOf(['free', 'premium', 'enterprise']),
    paymentMethod: Schema.string().optional(),
    features: Schema.array(Schema.string()),
});

console.log('\nTesting Complex Phone Validation:');
console.log(
    phoneSchema.validate({
        countryCode: '+1',
        number: '5551234567',
        extension: '123',
    })
);

console.log('\nTesting Date Range Validation:');
console.log(
    eventSchema.validate({
        title: 'Conference',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-03'),
        registrationDeadline: new Date('2024-12-15'),
    })
);

console.log('\nTesting Conditional Validation:');
console.log(
    subscriptionSchema.validate({
        type: 'premium',
        paymentMethod: 'credit_card',
        features: ['feature1', 'feature2'],
    })
);

import readline from 'readline';
import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const products = JSON.parse(fs.readFileSync('./products.json', 'utf-8'));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const tools = [
    {
        type: 'function',
        function: {
            name: 'filter_products',
            description:
                'Filter products based on user preferences. Typical inputs include things like "roller", "microwave", "above 4.3", "under 50 dollars", "in stock only".',
            parameters: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        description:
                            'Product category (e.g. "Electronics", "Fitness", "Kitchen", "Books", "Clothing")',
                    },
                    max_price: {
                        type: 'number',
                        description: 'Maximum price. For example: "under $50" → 50',
                    },
                    min_rating: {
                        type: 'number',
                        description: 'Minimum acceptable rating (e.g. "at least 4.3" → 4.3)',
                    },
                    in_stock: {
                        type: 'boolean',
                        description:
                            'Whether the product must be in stock. For example: "show only in-stock items" → true',
                    },
                    name_contains: {
                        type: 'string',
                        description: `Keyword that should appear in the product name. For example: "microwave" → matches "Microwave Oven", "roller" → matches "Foam Roller", etc.`,
                    },
                },
                required: [],
                additionalProperties: false,
            },
        },
    },
];

async function callFunction(name, args) {
    if (name !== 'filter_products') return [];

    const keyword = args.name_contains?.toLowerCase();

    return products.filter(product => {
        return (
            (!args.category || product.category === args.category) &&
            (!args.max_price || product.price <= args.max_price) &&
            (!args.min_rating || product.rating >= args.min_rating) &&
            (args.in_stock === undefined || product.in_stock === args.in_stock) &&
            (!keyword || product.name.toLowerCase().includes(keyword))
        );
    });
}

async function main() {
    rl.question('Enter your product preferences: ', async inputText => {
        const messages = [
            {
                role: 'system',
                content:
                    'You are a helpful assistant that helps users find products. When a user asks for a product, use the filter_products function to search for matching items.',
            },
            {
                role: 'user',
                content: inputText,
            },
        ];

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4.1-mini',
                messages: messages,
                tools: tools,
                tool_choice: 'auto',
            });

            const message = response.choices[0].message;
            const toolCalls = message.tool_calls;

            if (!toolCalls || toolCalls.length === 0) {
                console.log('Model response:', message.content);
                rl.close();
                return;
            }

            const results = [];

            for (const toolCall of toolCalls) {
                if (toolCall.type !== 'function') continue;

                let args;
                try {
                    args = JSON.parse(toolCall.function.arguments);
                } catch (e) {
                    console.error('Failed to parse arguments:', toolCall.function.arguments);
                    continue;
                }

                const functionResult = await callFunction(toolCall.function.name, args);
                results.push(...functionResult);
            }

            console.log('Filtered Products:');
            if (results.length === 0) {
                console.log('No products match your criteria.');
            } else {
                results.forEach((p, i) => {
                    console.log(
                        `${i + 1}. ${p.name} - $${p.price}, Rating: ${p.rating}, ${
                            p.in_stock ? 'In Stock' : 'Out of Stock'
                        }`
                    );
                });
            }
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
        }

        rl.close();
    });
}

main();

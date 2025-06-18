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
        name: 'filter_products',
        description: 'Filter products by category, price, rating, and stock status',
        parameters: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description:
                        'Product category (Electronics, Fitness, Kitchen, Books, Clothing)',
                },
                max_price: {
                    type: 'number',
                    description: 'Maximum price user is willing to pay',
                },
                min_rating: {
                    type: 'number',
                    description: 'Minimum acceptable rating',
                },
                in_stock: {
                    type: 'boolean',
                    description: 'Whether the product should be in stock',
                },
            },
            required: [],
            additionalProperties: false,
        },
    },
];

async function callFunction(name, args) {
    if (name !== 'filter_products') return [];

    return products.filter(product => {
        return (
            (!args.category || product.category === args.category) &&
            (!args.max_price || product.price <= args.max_price) &&
            (!args.min_rating || product.rating >= args.min_rating) &&
            (args.in_stock === undefined || product.in_stock === args.in_stock)
        );
    });
}

async function main() {
    rl.question('Enter your product preferences: ', async inputText => {
        const input = [{ role: 'user', content: inputText }];

        const response = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input,
            tools,
        });

        const toolCalls = response.output;

        const results = [];

        for (const toolCall of toolCalls) {
            if (toolCall.type !== 'function_call') continue;

            const args = JSON.parse(toolCall.arguments);
            const functionResult = await callFunction(toolCall.name, args);

            results.push(...functionResult);
        }

        console.log('\nFiltered Products:');
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

        rl.close();
    });
}

main();

require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function loadPromptTemplate() {
    return fs.readFileSync('prompt_template.txt', 'utf-8');
}

async function generateReport(inputText) {
    const promptTemplate = loadPromptTemplate();
    const finalPrompt = promptTemplate.replace('{{INPUT}}', inputText.trim());

    const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            { role: 'system', content: 'You are a product analyst generating structured reports.' },
            { role: 'user', content: finalPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
    });

    return response.choices[0].message.content;
}

async function appendToSampleOutputs(serviceTitle, reportContent) {
    const outputFile = 'sample_outputs.md';

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const entryHeader = `\n\n---\n\n# ${serviceTitle}\n_Request generated: ${timestamp}_\n\n`;
    const entry = entryHeader + reportContent + '\n';

    fs.appendFileSync(outputFile, entry, 'utf-8');

    console.log(`Report saved to ${outputFile}`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Please provide a service name or description.');
        process.exit(1);
    }

    // Extract input and output preference
    const input = args[0];
    const outputMode = args[1] || '--to-console'; // default to console

    console.log('Generating report...');
    const report = await generateReport(input);

    if (outputMode === '--to-file') {
        await appendToSampleOutputs(input, report);
    } else {
        console.log(`\nGenerated Report:\n\n${report}`);
    }
}

main();

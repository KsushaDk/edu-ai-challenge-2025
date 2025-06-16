# Service Analyzer Console App

This is a lightweight command-line tool that uses the OpenAI API to generate a structured, markdown-formatted analysis report about a service or product.

It accepts:

-   a **known service name** (like `"Spotify"`), or
-   a **raw description**

It then returns a **multi-section report** based on business, technical, and user perspectives.

---

## How It Works

1. You provide a service name or description via the terminal.
2. The app builds a custom prompt and sends it to the OpenAI API.
3. The model generates a markdown report with the following sections:
    - Brief History
    - Target Audience
    - Core Features
    - Unique Selling Points
    - Business Model
    - Tech Stack Insights
    - Perceived Strengths
    - Perceived Weaknesses
4. The report is shown in the terminal or saved to a file.

---

## Installation

1. Clone or download this project to your local machine

2. Install the required dependencies:

```bash
npm install dotenv openai
```

3. Create a `.env` file in the project root and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Usage

### Basic Syntax

```bash
node index.js "service_name_or_description" [output_mode]
```

### Output Modes

#### Console Output (Default)

Displays the generated report directly in the terminal:

```bash
node index.js "Netflix streaming service"
```

#### File Output

Saves the report to `sample_outputs.md` with timestamp:

```bash
node index.js "Netflix streaming service" --to-file
```

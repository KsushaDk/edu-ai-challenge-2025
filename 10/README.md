# Product Filtering App using OpenAI Function Calling (`tools` API)

This is a console-based product search tool that uses OpenAI’s **new `tools` interface** and `responses.create()` to filter a local product dataset based on natural language user input.

---

## Features

-   Accepts natural queries like:
    “Find fitness items under $50 with good reviews”
-   Uses `gpt-4.1-mini` with OpenAI's **function calling via `tools`**
-   Translates user preferences into structured filters (category, price, rating, availability)
-   Supports **multiple tool calls** per request
-   Searches a local `products.json` dataset
-   Outputs matching products in a clean, formatted list

---

## Setup Instructions

### 1. Clone or download this project to your local machine

### 2. Install Dependencies

```bash
npm install openai dotenv
```

### 3. Create .env File

OPENAI_API_KEY=your-api-key-here

### 4. Run the Application

```bash
node index.js
```

### 5. Example Interaction:

```bash
Enter your product preferences: I need electronics under $100 and rated above 4.5
```

### Multiple Tool Calls

This app supports multiple function calls per request.

For example:

```bash
"Show me cheap electronics and highly rated books"
```

The model may generate two tool calls:

```bash
filter_products({ category: 'Electronics', max_price: 100 })

filter_products({ category: 'Books', min_rating: 4.5 })
```

Both will be processed, and results combined and shown.

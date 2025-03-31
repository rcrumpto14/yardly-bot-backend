# Yardly Bot Backend

Backend server for the Yardly Bot application, built with Node.js, Express, and the OpenAI Agents SDK.

## Features

- RESTful API endpoints for the Yardly Bot frontend
- Integration with OpenAI Agents SDK for AI-powered functionality
- Agent handoff capabilities for specialized tasks
- Secure authentication and authorization
- Environment-based configuration

## Tech Stack

- Node.js & Express
- OpenAI Agents SDK
- MongoDB (for data persistence)
- JWT for authentication
- Docker support for containerization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rcrumpto14/yardly-bot-backend.git
   cd yardly-bot-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/yardly-bot
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
yardly-bot-backend/
├── src/
│   ├── agents/         # OpenAI Agents configurations
│   ├── config/         # Application configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
├── .env                # Environment variables (not in repo)
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## API Documentation

API documentation will be available at `/api-docs` when the server is running.

## License

MIT
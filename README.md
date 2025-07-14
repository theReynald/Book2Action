# Book2Action

A modern React application that transforms books into actionable insights.

## Features

- 🔍 Search for books by title
- 📖 Get comprehensive book summaries
- ✅ Receive 10 actionable steps from each book
- 🎨 Beautiful, modern UI with glass morphism effects
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/theReynald/Book2Action.git
cd Book2Action
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` and add your OpenRouter API key:
```
REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key_here
```
Get your API key from [OpenRouter](https://openrouter.ai/)

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **OpenRouter API** with Grok for AI-powered book analysis

## Environment Variables

The following environment variables are required:

- `REACT_APP_OPENROUTER_API_KEY` - Your OpenRouter API key for AI-powered book analysis

## Sample Books

The app currently includes sample data for:
- Atomic Habits by James Clear
- Think and Grow Rich by Napoleon Hill
- The 7 Habits of Highly Effective People by Stephen R. Covey

## Future Enhancements

- Integration with book APIs (Google Books, OpenLibrary)
- AI-powered summary generation
- User accounts and saved books
- Social sharing features
- More book categories and genres

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

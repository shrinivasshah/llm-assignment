# Merkle Assignment - AI Chat Application

A modern, responsive AI chat application built with React, TypeScript, and OpenAI integration. Features a rich text editor, multi-tab conversations, and a clean, intuitive interface.

## ✨ Features

- **AI-Powered Conversations**: Integrated with OpenAI for intelligent chat responses
- **Rich Text Editor**: TipTap-based WYSIWYG editor with support for:
  - Text formatting (bold, italic, underline)
  - Links and images
  - Emojis
  - Text alignment
  - Placeholders
- **Multi-Tab Interface**: Manage multiple chat conversations simultaneously
- **Markdown Support**: Render and display markdown content with syntax highlighting
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Streaming**: Stream AI responses in real-time
- **Message Management**: Edit, delete, and manage chat messages
- **Error Handling**: Comprehensive error boundary and error handling
- **Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

### Core

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Tailwind Typography** - Typography plugin

### Rich Text Editor

- **TipTap** - Headless editor framework
- **TipTap Extensions**:
  - Starter Kit
  - Emoji support
  - Image handling
  - Link management
  - Placeholder text
  - Text alignment
  - Underline formatting

### AI Integration

- **OpenAI** - AI chat completions
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting
- **Remark GFM** - GitHub Flavored Markdown

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit linting

### Testing

- **Vitest** - Testing framework
- **Testing Library** - Component testing utilities
- **JSDOM** - DOM environment for tests

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd merkle-assignment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run preview` - Preview production build locally

### Building

- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

### Formatting

- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint:format` - Run both linting and formatting

### Testing

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## 🏗️ Project Structure

```
src/
├── assets/           # Static assets and SVG icons
├── components/       # Reusable React components
│   ├── chat/         # Chat-specific components
│   ├── chatbox/      # Message display and management
│   ├── header/       # Application header
│   ├── sidebar/      # Navigation sidebar
│   ├── wysiwyg/      # Rich text editor components
│   └── ...
├── constants/        # Application constants
├── context/          # React context providers
├── design-system/    # Design system components
├── enums/            # TypeScript enums
├── error-boundary/   # Error handling components
├── helpers/          # Utility functions
├── hooks/            # Custom React hooks
├── layout/           # Layout components
├── pages/            # Page components
├── routes/           # Routing configuration
├── utils/            # Utility functions
└── test/             # Test utilities
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration
- `vitest.config.ts` - Vitest testing configuration

## 💡 Key Features Explained

### Chat Management

The application uses React Context to manage chat state across multiple tabs. Each tab maintains its own conversation history with support for:

- Creating new chat tabs
- Switching between active tabs
- Message history persistence
- Real-time message streaming

### Rich Text Editor

Built with TipTap, the editor provides:

- WYSIWYG editing experience
- Markdown-compatible output
- Extensible plugin architecture
- Custom styling and theming

### AI Integration

- Secure OpenAI API integration
- Streaming response handling
- Error handling and retry logic
- Message formatting and display

## 🎨 Styling

The application uses Tailwind CSS for styling with:

- Responsive design patterns
- Custom design system components
- Dark/light theme support considerations
- Accessibility-focused color schemes

## 🧪 Testing

The project includes comprehensive testing setup with:

- Unit tests for components
- Integration tests for context providers
- Mock implementations for external APIs
- Coverage reporting

Run tests with:

```bash
npm run test:coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

Ensure the following environment variables are set for production:

- `VITE_OPENAI_API_KEY` - Your OpenAI API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Use semantic commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is part of the Merkle assignment and is intended for evaluation purposes.

## 🔧 Troubleshooting

### Common Issues

1. **OpenAI API Key Issues**
   - Ensure your API key is correctly set in the `.env` file
   - Verify the API key has the necessary permissions

2. **Build Issues**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript errors with `npm run build`

3. **Development Server Issues**
   - Ensure port 5173 is available
   - Check for any conflicting processes

### Support

For issues related to this assignment, please refer to the project requirements or contact the assignment coordinator.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

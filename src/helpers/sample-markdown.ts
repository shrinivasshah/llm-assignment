/**
 * Helper function to read sample markdown content
 * This simulates reading from the sample.md file
 */

// Sample markdown content from sample.md file
const SAMPLE_MARKDOWN_CONTENT = `# PDF Upload & Analysis System

A focused full-stack application for uploading and analyzing PDF resumes and cover letters using AI to provide comprehensive candidate assessments.

## 🛠️ Tech Stack

### Backend
- **Fastify** - Fast and efficient web framework
- **tRPC** - End-to-end typesafe APIs
- **TypeScript** - Type safety and developer experience
- **Google Gemini AI** - Advanced AI analysis
- **Zod** - Runtime type validation

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **TypeScript** - Full type safety
- **SCSS Modules** - Component-scoped styling
- **React Dropzone** - File upload interface
- **TanStack Query** - Server state management

### Development & Tooling
- **ESLint** - Separate configurations for server and client
- **Vitest** - Fast unit testing framework
- **Husky** - Git hooks for code quality
- **TypeScript** - Full type safety across the stack

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google AI API Key** for Gemini AI integration

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd profile-analyzer
\`\`\`

### 2. Install Dependencies

Install root dependencies:
\`\`\`bash
npm install
\`\`\`

Install client dependencies:
\`\`\`bash
cd src/client
npm install
cd ../..
\`\`\`

### 3. Environment Setup

Create a \`.env\` file in the root directory:

\`\`\`env
# Google AI API Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Server Configuration
PORT=2022
NODE_ENV=development
\`\`\`

### 4. Start Development

Run both server and client in development mode:

\`\`\`bash
npm run dev
\`\`\`

This will start:
- **Server** on \`http://localhost:2022\`
- **Client** on \`http://localhost:3000\` (or next available port)

### 5. Alternative: Start Components Separately

Start only the server:
\`\`\`bash
npm run dev:server
\`\`\`

Start only the client:
\`\`\`bash
npm run dev:client
\`\`\`

## 🧪 Testing

Run the test suite:

\`\`\`bash
npm test
\`\`\`

Run tests in watch mode:
\`\`\`bash
npm test -- --watch
\`\`\`

Run specific test files:
\`\`\`bash
npm test -- pdf-router.test.ts
\`\`\`

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start both server and client in development |
| \`npm run dev:server\` | Start only the server |
| \`npm run dev:client\` | Start only the client |
| \`npm run build\` | Build the application for production |
| \`npm run start\` | Start production build |
| \`npm test\` | Run test suite |
| \`npm run lint\` | Run ESLint on both server and client |
| \`npm run lint:server\` | Run ESLint on server code only |
| \`npm run lint:client\` | Run ESLint on client code only |
| \`npm run typecheck\` | Run TypeScript type checking |

## 📊 API Endpoints

### Upload PDF Analysis
\`\`\`typescript
POST /trpc/pdf.upload
\`\`\`

**Request Body:**
\`\`\`json
{
  "resume": {
    "filename": "resume.pdf",
    "content": "base64_encoded_content",
    "mimetype": "application/pdf"
  },
  "coverLetter": {  // Optional
    "filename": "cover-letter.pdf", 
    "content": "base64_encoded_content",
    "mimetype": "application/pdf"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Successfully analyzed 1 document(s)",
  "analysis": {
    "overallScore": 85,
    "techStack": ["JavaScript", "React", "Node.js"],
    "strengths": ["Strong technical skills", "Good communication"],
    "weaknesses": ["Limited leadership experience"]
  }
}
\`\`\`

### Test Connection
\`\`\`typescript
GET /trpc/pdf.test
\`\`\``;

/**
 * Simulates reading markdown content from a file
 * In a real application, you might fetch this from an API or read from a file
 */
export const readSampleMarkdown = (): string => {
  return SAMPLE_MARKDOWN_CONTENT;
};

export default readSampleMarkdown;

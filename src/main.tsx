import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ChatProvider } from './context/chat-context.tsx';
import DataRouter from '@/routes/data-router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatProvider>
      <DataRouter />
    </ChatProvider>
  </StrictMode>
);

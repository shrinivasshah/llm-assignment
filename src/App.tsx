import './App.css';
import { Routes, Route } from 'react-router';
import Home from './pages/home';
import Chat from './pages/chat';
import { ChatTabsProvider } from '@/context/chat-tabs-context';
import Layout from './layout/layout';

function App() {
  return (
    <ChatTabsProvider>
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/:id' element={<Chat />} />
        </Routes>
      </Layout>
    </ChatTabsProvider>
  );
}

export default App;

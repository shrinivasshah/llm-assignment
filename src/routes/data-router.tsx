import App from '@/App';
import ErrorBoundary from '@/error-boundary/error-boundary';
import ChatPage from '@/pages/chat';
import Home from '@/pages/home';
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorBoundary />,
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/:tabId',
        element: <ChatPage />,
      },
    ],
  },
]);

export default () => <RouterProvider router={router} />;

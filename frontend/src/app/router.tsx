import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

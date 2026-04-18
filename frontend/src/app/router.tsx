import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { RequireAuth } from './RequireAuth';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import EventsListPage from '@/pages/admin/EventsListPage';
import EventDetailPage from '@/pages/admin/EventDetailPage';
import JudgeTeamsPage from '@/pages/judge/JudgeTeamsPage';
import JudgeScorePage from '@/pages/judge/JudgeScorePage';
import LeaderboardPage from '@/pages/leaderboard/LeaderboardPage';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/admin/events',
        element: (
          <RequireAuth roles={['admin']}>
            <EventsListPage />
          </RequireAuth>
        ),
      },
      {
        path: '/admin/events/:id',
        element: (
          <RequireAuth roles={['admin']}>
            <EventDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: '/judge',
        element: (
          <RequireAuth roles={['judge', 'admin']}>
            <JudgeTeamsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/judge/teams/:teamId',
        element: (
          <RequireAuth roles={['judge', 'admin']}>
            <JudgeScorePage />
          </RequireAuth>
        ),
      },
      { path: '/events/:id/leaderboard', element: <LeaderboardPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

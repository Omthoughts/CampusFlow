import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import NoticesList from '../features/notices/NoticesList';
import NoticeDetail from '../features/notices/NoticeDetail';
import EventsList from '../features/events/EventsList';
import EventDetail from '../features/events/EventDetail';
import DeadlinesList from '../features/deadlines/DeadlinesList';

import AdminLayout from '../features/admin/AdminLayout';
import AdminDashboard from '../features/admin/AdminDashboard';
import NoticeUpload from '../features/admin/NoticeUpload';
import AdminNoticeManagement from '../features/admin/AdminNoticeManagement';
import NoticeReview from '../features/admin/NoticeReview';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'notices',
        element: <AdminNoticeManagement />,
      },
      {
        path: 'notices/upload',
        element: <NoticeUpload />,
      },
      {
        path: 'notices/:id/review',
        element: <NoticeReview />,
      },
      {
        path: '',
        element: <Navigate to="/admin/dashboard" replace />,
      },
    ],
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'notices',
        element: <NoticesList />,
      },
      {
        path: 'notices/:id',
        element: <NoticeDetail />,
      },
      {
        path: 'events',
        element: <EventsList />,
      },
      {
        path: 'events/:id',
        element: <EventDetail />,
      },
      {
        path: 'deadlines',
        element: <DeadlinesList />,
      },
      {
        path: 'calendar',
        element: <EventsList />,
      },
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
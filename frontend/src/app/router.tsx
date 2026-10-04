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
import NoticeReview from '../features/admin/NoticeReview';
import AdminNoticesList from '../features/admin/AdminNoticesList';
import AdminEventsList from '../features/admin/AdminEventsList';
import AdminAuditLogs from '../features/admin/AdminAuditLogs';
import AdminLogin from '../features/admin/AdminLogin';
import CalendarView from '../features/calendar/CalendarView';
import ErrorBoundary from '../components/common/ErrorBoundary';

import RoleGuard from '../components/common/RoleGuard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/admin',
    element: (
      <RoleGuard allowedRoles={['ADMIN', 'FACULTY']} fallbackPath="/dashboard">
        <AdminLayout />
      </RoleGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'notices',
        element: <AdminNoticesList />,
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
        path: 'events',
        element: <AdminEventsList />,
      },
      {
        path: 'audit',
        element: (
          <RoleGuard allowedRoles={['ADMIN']} fallbackPath="/admin/dashboard">
            <AdminAuditLogs />
          </RoleGuard>
        ),
      },
      {
        path: '',
        element: <Navigate to="/admin/dashboard" replace />,
      }
    ]
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
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
        element: <CalendarView />,
      },
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      }
    ],
  },
  {
    path: '*',
    element: <ErrorBoundary />,
  }
]);

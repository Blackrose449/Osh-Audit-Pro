import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Login } from '@/routes/auth/Login';
import { Register } from '@/routes/auth/Register';
import { ResetPassword } from '@/routes/auth/ResetPassword';
import { Dashboard } from '@/routes/Dashboard';
import { Companies } from '@/routes/Companies';
import { Workplaces } from '@/routes/Workplaces';
import { Audits } from '@/routes/Audits';
import { AuditCreate } from '@/routes/AuditCreate';
import { AuditDetail } from '@/routes/AuditDetail';
import { Findings } from '@/routes/Findings';
import { Review } from '@/routes/Review';
import { ReportSetup } from '@/routes/ReportSetup';
import { Reports } from '@/routes/Reports';
import { Actions } from '@/routes/Actions';
import { Team } from '@/routes/Team';
import { NotFound, Forbidden, SessionExpired } from '@/routes/errors';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'companies', element: <Companies /> },
      { path: 'companies/:id/workplaces', element: <Workplaces /> },
      { path: 'audits', element: <Audits /> },
      { path: 'audits/new', element: <AuditCreate /> },
      { path: 'audits/:id', element: <AuditDetail /> },
      { path: 'audits/:id/findings', element: <Findings /> },
      { path: 'audits/:id/review', element: <Review /> },
      { path: 'audits/:id/report', element: <ReportSetup /> },
      { path: 'reports', element: <Reports /> },
      { path: 'actions', element: <Actions /> },
      { path: 'team', element: <Team /> },
      { path: '403', element: <Forbidden /> },
      { path: 'session-expired', element: <SessionExpired /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '*', element: <NotFound /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

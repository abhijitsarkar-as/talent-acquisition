import { Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RoleRoute } from './auth/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SkillTaxonomyAdminPage } from './pages/SkillTaxonomyAdminPage';
import { UsersPage } from './pages/UsersPage';
import { TemplatesAdminPage } from './pages/TemplatesAdminPage';
import { RequisitionsListPage } from './pages/RequisitionsListPage';
import { RequisitionFormPage } from './pages/RequisitionFormPage';
import { RequisitionDetailPage } from './pages/RequisitionDetailPage';
import { CandidatesListPage } from './pages/CandidatesListPage';
import { PipelineBoardPage } from './pages/PipelineBoardPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { RecruiterDashboardPage } from './pages/RecruiterDashboardPage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-dashboard" element={<RecruiterDashboardPage />} />
          <Route path="/team-dashboard" element={<TeamDashboardPage />} />

          <Route path="/requisitions" element={<RequisitionsListPage />} />
          <Route path="/requisitions/new" element={<RequisitionFormPage />} />
          <Route path="/requisitions/:id" element={<RequisitionDetailPage />} />
          <Route path="/requisitions/:id/pipeline" element={<PipelineBoardPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/candidates" element={<CandidatesListPage />} />
          <Route path="/templates" element={<TemplatesAdminPage />} />

          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/skill-taxonomy" element={<SkillTaxonomyAdminPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

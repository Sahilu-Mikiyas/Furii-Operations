import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { useRealtimeSync } from "@/hooks/useRealtime";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";


// Guards
import { AdminGuard, ClientGuard, RootRedirect } from "@/components/routes/RoleGuards";


// Login Pages
import { AgencyLoginPage } from "@/pages/auth/AgencyLoginPage";
import { ClientLoginPage } from "@/pages/auth/ClientLoginPage";

// Admin Pages
import { DashboardPage } from "@/pages/DashboardPage";
import { ClientsPage } from "@/pages/ClientsPage";
import { AdminRequestsPage } from "@/pages/admin/AdminRequestsPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { TasksPage } from "@/pages/TasksPage";
import { ApprovalsPage } from "@/pages/ApprovalsPage";
import { PaymentsPage } from "@/pages/PaymentsPage";
import { FilesPage } from "@/pages/FilesPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";




// Client Portal Pages
import { ClientOverviewPage } from "@/pages/portal/ClientOverviewPage";
import { ClientApprovalsPage } from "@/pages/portal/ClientApprovalsPage";
import { ClientServicesPage } from "@/pages/portal/ClientServicesPage";
import { ClientCatalogPage } from "@/pages/portal/ClientCatalogPage";
import { ClientPaymentPage } from "@/pages/portal/ClientPaymentPage";
import { ClientFilesPage } from "@/pages/portal/ClientFilesPage";
import { ClientFinancialsPage } from "@/pages/portal/ClientFinancialsPage";
import { ClientSchedulePage } from "@/pages/portal/ClientSchedulePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  useRealtimeSync();

  return (
    <Routes>
      {/* Root Entry */}
      <Route path="/" element={<RootRedirect />} />

      {/* Authentication Gates */}
      <Route path="/auth/agency" element={<AgencyLoginPage />} />
      <Route path="/portal/login" element={<ClientLoginPage />} />
      <Route path="/auth" element={<Navigate to="/auth/agency" replace />} />

      {/* Admin / Project Manager Dedicated Route Group */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminGuard>
            <DashboardPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <AdminGuard>
            <ClientsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <AdminGuard>
            <AdminRequestsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <AdminGuard>
            <ProjectsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <AdminGuard>
            <TasksPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <AdminGuard>
            <ApprovalsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminGuard>
            <PaymentsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/files"
        element={
          <AdminGuard>
            <FilesPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/calendar"
        element={
          <AdminGuard>
            <CalendarPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminGuard>
            <ReportsPage />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminGuard>
            <SettingsPage />
          </AdminGuard>
        }
      />


      {/* Client Portal Dedicated Route Group */}

      <Route
        path="/portal/overview"
        element={
          <ClientGuard>
            <ClientOverviewPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/approvals"
        element={
          <ClientGuard>
            <ClientApprovalsPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/services"
        element={
          <ClientGuard>
            <ClientServicesPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/catalog"
        element={
          <ClientGuard>
            <ClientCatalogPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/payment"
        element={
          <ClientGuard>
            <ClientPaymentPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/files"
        element={
          <ClientGuard>
            <ClientFilesPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/financials"
        element={
          <ClientGuard>
            <ClientFinancialsPage />
          </ClientGuard>
        }
      />
      <Route
        path="/portal/schedule"
        element={
          <ClientGuard>
            <ClientSchedulePage />
          </ClientGuard>
        }
      />

      {/* Legacy Redirects */}
      <Route path="/clients" element={<Navigate to="/admin/clients" replace />} />
      <Route path="/projects" element={<Navigate to="/admin/projects" replace />} />
      <Route path="/tasks" element={<Navigate to="/admin/tasks" replace />} />
      <Route path="/approvals" element={<Navigate to="/admin/approvals" replace />} />
      <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
      <Route path="/files" element={<Navigate to="/admin/files" replace />} />
      <Route path="/calendar" element={<Navigate to="/admin/calendar" replace />} />
      <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
      <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


export default App;

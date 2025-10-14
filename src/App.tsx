import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// removed Index landing page; root now routes to TableView
import { TableView } from "./pages/TableView";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
// removed unused Dashboard import
import MembersTable from "./components/MembersTable";

import WorkItemsTable from "./components/AdminWorkItemsTable";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";

import { AuthProvider, useAuth } from "@/Contexts/AuthContext";
import VolunteerWorkOrder from "./pages/VolunteerWorkOrder";
import Proof from "./pages/Proof";
import Statics from "./pages/statics";
import FacultyReportForm from "./pages/FacultyReportForm";
import FacultyReportView from "@/pages/FacultyReportView";
import { useParams } from "react-router-dom";
import AdminGroups from "./pages/AdminGroups";
import { DashboardPage } from "./components/Dashboard/WorkItemCard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <AuthProvider>
           <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TableView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/table"
              element={
                <ProtectedRoute>
                  <TableView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="proof" element={<ProtectedRoute>
              <VolunteerWorkOrder />
            </ProtectedRoute>} />

            <Route path="faculty-report" element={<ProtectedRoute>
              <FacultyReportForm />
            </ProtectedRoute>} />

            <Route path="faculty-report/view/:reportId" element={
              <ProtectedRoute>
                <FacultyReportViewWrapper />
              </ProtectedRoute>
            } />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="statics" element={<Statics />} />
              <Route path="members" element={<MembersTable />} />
              <Route path="tasks" element={<WorkItemsTable />} />
              <Route path="volunteer" element={<VolunteerWorkOrder />} />
              <Route path="admin-groups" element={<AdminGroups />} />
              <Route path="statics" element={<DashboardPage />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
         
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

function FacultyReportViewWrapper() {
  const { reportId } = useParams<{ reportId: string }>();
  if (!reportId) return <div>No report selected.</div>;
  return <FacultyReportView reportId={reportId} />;
}


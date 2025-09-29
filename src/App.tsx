import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { TableView } from "./pages/TableView";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import MembersTable from "./components/MembersTable";

import WorkItemsTable from "./components/AdminWorkItemsTable";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";

import { useAuth } from "@/Contexts/AuthContext";
import VolunteerWorkOrder from "./pages/VolunteerWorkOrder";
import Proof from "./pages/Proof";
import Statics from "./pages/statics";

const queryClient = new QueryClient();

const App = () => {
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
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
              <Proof />
            </ProtectedRoute>} />
            {/* Dashboard routes */}
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route path="statics" element={<Statics />} />
              <Route path="members" element={<MembersTable />} />
              <Route path="tasks" element={<WorkItemsTable />} />
              <Route path="calendar" element={<div>Calendar Page</div>} />
              <Route path="volunteer" element={<VolunteerWorkOrder />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

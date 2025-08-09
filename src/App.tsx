import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import Profile from "./pages/Profile";
import SkillSelection from "./pages/SkillSelection";
import CompanySelection from "./pages/CompanySelection";
import AlumniVerification from "./pages/AlumniVerification";
import Feed from "./pages/Feed";
import BlogDetail from "./pages/BlogDetail";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, GuestRoute, AuthenticatedRoute, StudentRoute, AlumniRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes - accessible to everyone */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                
                {/* Guest-only routes - redirect authenticated users */}
                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                <Route path="/register" element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } />
                
                {/* Protected routes - require authentication */}
                <Route path="/profile" element={
                  <AuthenticatedRoute>
                    <Profile />
                  </AuthenticatedRoute>
                } />
                <Route path="/skill-selection" element={
                  <AuthenticatedRoute>
                    <SkillSelection />
                  </AuthenticatedRoute>
                } />
                <Route path="/company-selection" element={
                  <AuthenticatedRoute>
                    <CompanySelection />
                  </AuthenticatedRoute>
                } />
                <Route path="/feed" element={
                  <AuthenticatedRoute>
                    <Feed />
                  </AuthenticatedRoute>
                } />
                <Route path="/blog/:id" element={
                  <AuthenticatedRoute>
                    <BlogDetail />
                  </AuthenticatedRoute>
                } />
                
                {/* Alumni-specific routes */}
                <Route path="/verify" element={
                  <AlumniRoute>
                    <AlumniVerification />
                  </AlumniRoute>
                } />
                
                {/* Admin routes - require authentication (could be extended for admin-only) */}
                <Route path="/admin" element={
                  <AuthenticatedRoute>
                    <AdminPanel />
                  </AuthenticatedRoute>
                } />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App render error:', error);
    return <div>Error loading app. Check console for details.</div>;
  }
};

export default App;

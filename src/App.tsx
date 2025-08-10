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
import CreatePost from "./pages/CreatePost";
import BlogDetail from "./pages/BlogDetail";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { Trending } from "./pages/Trending";
import { CommunityPage } from "./pages/CommunityPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { FollowProvider } from "@/contexts/FollowContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProtectedRoute, GuestRoute, AuthenticatedRoute, StudentRoute, AlumniRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";

const queryClient = new QueryClient();

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BlogProvider>
              <FollowProvider>
                <NotificationProvider>
                  <CommunityProvider>
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
                        
                        {/* Protected routes with sidebar */}
                        <Route path="/feed" element={
                          <AuthenticatedRoute>
                            <div className="flex w-full min-h-screen">
                              <Sidebar />
                              <div className="flex-1 ml-64 overflow-auto">
                                <Feed />
                              </div>
                            </div>
                          </AuthenticatedRoute>
                        } />
                        
                        <Route path="/trending" element={
                          <AuthenticatedRoute>
                            <div className="flex w-full min-h-screen">
                              <Sidebar />
                              <div className="flex-1 ml-64 overflow-auto">
                                <Trending />
                              </div>
                            </div>
                          </AuthenticatedRoute>
                        } />
                        
                        <Route path="/g/:communityName" element={
                          <AuthenticatedRoute>
                            <div className="flex w-full min-h-screen">
                              <Sidebar />
                              <div className="flex-1 ml-64 overflow-auto">
                                <CommunityPage />
                              </div>
                            </div>
                          </AuthenticatedRoute>
                        } />
                        
                        <Route path="/create-post" element={
                          <AuthenticatedRoute>
                            <div className="flex w-full min-h-screen">
                              <Sidebar />
                              <div className="flex-1 ml-64 overflow-auto">
                                <CreatePost />
                              </div>
                            </div>
                          </AuthenticatedRoute>
                        } />
                        
                        <Route path="/blog/:id" element={
                          <AuthenticatedRoute>
                            <div className="flex w-full min-h-screen">
                              <Sidebar />
                              <div className="flex-1 ml-64 overflow-auto">
                                <BlogDetail />
                              </div>
                            </div>
                          </AuthenticatedRoute>
                        } />
                        
                        {/* Protected routes without sidebar */}
                        <Route path="/profile" element={
                          <AuthenticatedRoute>
                            <Profile />
                          </AuthenticatedRoute>
                        } />
                        <Route path="/user/:userId" element={
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
                  </CommunityProvider>
                </NotificationProvider>
              </FollowProvider>
            </BlogProvider>
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

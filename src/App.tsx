import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import TestLogo from "./pages/TestLogo";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import Profile from "./pages/Profile";
import SkillSelection from "./pages/SkillSelection";
import AlumniVerification from "./pages/AlumniVerification";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import CreateCommunity from "./pages/CreateCommunity";
import BlogDetail from "./pages/BlogDetail";
import AdminPanel from "./pages/AdminPanel";
import AdminPanelNew from "./pages/AdminPanelNew";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Trending } from "./pages/Trending";
import { CommunityPage } from "./pages/CommunityPage";
import { AllCommunities } from "./pages/AllCommunities";
import { ProspectiveStudent } from "./pages/ProspectiveStudent";
import { ProspectiveQuestions } from "./pages/ProspectiveQuestions";
import { ProspectiveLogin } from "./pages/ProspectiveLogin";
import { CUCommunity } from "./pages/CUCommunity";
import { FundraiserPortal } from "./pages/FundraiserPortal";
import { AuthProvider } from "@/contexts/AuthContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { FollowProvider } from "@/contexts/FollowContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProtectedRoute, GuestRoute, AuthenticatedRoute, StudentRoute, AlumniRoute, StudentAlumniRoute } from "@/components/ProtectedRoute";
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
                        <Route path="/test-logo" element={<TestLogo />} />
                        <Route path="/cu-questions" element={<ProspectiveQuestions />} />
                        
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
                        <Route path="/prospective-student" element={
                          <GuestRoute>
                            <ProspectiveStudent />
                          </GuestRoute>
                        } />
                        <Route path="/prospective-login" element={
                          <GuestRoute>
                            <ProspectiveLogin />
                          </GuestRoute>
                        } />
                        
                        {/* Protected routes with sidebar - Students and Alumni only */}
                        <Route path="/feed" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-4xl">
                                  <Feed />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/community-qa" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-6xl">
                                  <CUCommunity />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/trending" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-4xl">
                                  <Trending />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/communities" element={
                          <StudentAlumniRoute>
                            <AllCommunities />
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/fundraisers" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-7xl">
                                  <FundraiserPortal />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/g/:communityName" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-6xl">
                                  <CommunityPage />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/create-post" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-4xl">
                                  <CreatePost />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/create-community" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-4xl">
                                  <CreateCommunity />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        <Route path="/blog/:id" element={
                          <StudentAlumniRoute>
                            <div className="relative w-full min-h-screen">
                              <Sidebar />
                              <div className="w-full overflow-auto flex justify-center">
                                <div className="w-full max-w-4xl">
                                  <BlogDetail />
                                </div>
                              </div>
                            </div>
                          </StudentAlumniRoute>
                        } />
                        
                        {/* Protected routes without sidebar - Students and Alumni only */}
                        <Route path="/profile" element={
                          <StudentAlumniRoute>
                            <Profile />
                          </StudentAlumniRoute>
                        } />
                        <Route path="/user/:userId" element={
                          <StudentAlumniRoute>
                            <Profile />
                          </StudentAlumniRoute>
                        } />
                        <Route path="/skill-selection" element={
                          <StudentAlumniRoute>
                            <SkillSelection />
                          </StudentAlumniRoute>
                        } />
                        
                        {/* Alumni-specific routes */}
                        <Route path="/verify" element={
                          <AlumniRoute>
                            <AlumniVerification />
                          </AlumniRoute>
                        } />
                        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/admin-panel-new" element={<AdminPanelNew />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        
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

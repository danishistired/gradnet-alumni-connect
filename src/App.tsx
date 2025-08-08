import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import SkillSelection from "./pages/SkillSelection";
import CompanySelection from "./pages/CompanySelection";
import AlumniVerification from "./pages/AlumniVerification";
import Feed from "./pages/Feed";
import BlogDetail from "./pages/BlogDetail";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";

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
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/skill-selection" element={<SkillSelection />} />
                <Route path="/company-selection" element={<CompanySelection />} />
                <Route path="/verify" element={<AlumniVerification />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/admin" element={<AdminPanel />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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

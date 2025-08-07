import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { User, Plus, Home, Users } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface NavbarProps {
  user?: {
    type: 'student' | 'alumni';
    verified?: boolean;
  };
}

export const Navbar = ({ user }: NavbarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>
          
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/feed" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/feed') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Home className="w-4 h-4" />
                Feed
              </Link>
              <Link 
                to="/network" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/network') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Users className="w-4 h-4" />
                Network
              </Link>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {user && (
              <>
                {user.verified !== false && (
                  <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover">
                    <Plus className="w-4 h-4 mr-1" />
                    Post Blog
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </>
            )}
            {!user && (
              <Link to="/login">
                <Button variant="default" className="bg-accent hover:bg-accent-hover">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
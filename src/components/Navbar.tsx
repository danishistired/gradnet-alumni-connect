import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Home, Users, Mail, Bell, ShoppingCart, Menu, Settings, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMessagesClick?: () => void;
}

export const Navbar = ({ onMessagesClick }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });
  const homeRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => location.pathname === path;

  // Update active indicator position
  useEffect(() => {
    const updateActiveIndicator = () => {
      let activeRef = null;
      
      if (location.pathname === '/') {
        activeRef = homeRef.current;
      } else if (location.pathname === '/about') {
        activeRef = aboutRef.current;
      }
      
      if (activeRef && navContainerRef.current) {
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const activeRect = activeRef.getBoundingClientRect();
        
        setActiveIndicator({
          left: activeRect.left - containerRect.left,
          width: activeRect.width
        });
      } else {
        // Hide indicator if no active page
        setActiveIndicator({ left: 0, width: 0 });
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateActiveIndicator, 50);
    
    // Update on window resize
    window.addEventListener('resize', updateActiveIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateActiveIndicator);
    };
  }, [location.pathname]);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Desktop Navigation */}
          <div ref={navContainerRef} className="hidden md:flex items-center space-x-6 relative">
            {/* Sliding Active Indicator */}
            <div 
              className="absolute top-2 bottom-2 bg-accent-light rounded-lg transition-all duration-300 ease-in-out z-0 shadow-sm"
              style={{
                left: `${activeIndicator.left}px`,
                width: `${activeIndicator.width}px`,
                opacity: (isActive('/') || isActive('/about')) ? 1 : 0,
                transform: `translateZ(0)` // Force hardware acceleration
              }}
            />
            
            <Link 
              ref={homeRef}
              to="/" 
              className={`relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link 
              ref={aboutRef}
              to="/about" 
              className={`relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/about') ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users className="w-4 h-4" />
              About
            </Link>
            {user && (
              <>
                <Link 
                  to="/feed" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/feed') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
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
              </>
            )}
          </div>
          
          {/* Right side elements */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Shopping Cart Icon */}
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                </Button>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-4 h-4" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        1
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem>
                      <span className="text-sm">Some news</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="text-sm">Another news</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="text-sm">Something else here</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Messages */}
                {onMessagesClick && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onMessagesClick}
                    className="relative"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
                  </Button>
                )}

                {/* Profile Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback>
                          {user.firstName ? user.firstName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Post Blog Button */}
                <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover hidden sm:flex">
                  <Plus className="w-4 h-4 mr-1" />
                  Post Blog
                </Button>
              </>
            )}
            
            {/* Sign Up/Login buttons for non-authenticated users */}
            {!user && (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" className="bg-accent hover:bg-accent-hover">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                to="/about" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/about') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                About
              </Link>
              
              {user && (
                <>
                  <Link 
                    to="/feed" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/feed') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/network" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/network') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    Network
                  </Link>
                  
                  <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover justify-start">
                    <Plus className="w-4 h-4 mr-1" />
                    Post Blog
                  </Button>
                </>
              )}
              
              {!user && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-text-primary">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full justify-start bg-accent hover:bg-accent-hover">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
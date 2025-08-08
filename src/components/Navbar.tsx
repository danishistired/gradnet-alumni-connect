import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Home, Users, Mail, Bell, ShoppingCart, Menu, Settings, LogOut } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

interface NavbarProps {
  user?: {
    type: 'student' | 'alumni' | 'admin';
    verified?: boolean;
    name?: string;
    avatar?: string;
  };
  onMessagesClick?: () => void;
}

export const Navbar = ({ user, onMessagesClick }: NavbarProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
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
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link 
              to="/about" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/about') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
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
                          src={user.avatar || "https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"} 
                          alt={user.name || "User avatar"} 
                        />
                        <AvatarFallback>
                          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Post Blog Button for verified users */}
                {user.verified !== false && user.type !== 'admin' && (
                  <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover hidden sm:flex">
                    <Plus className="w-4 h-4 mr-1" />
                    Post Blog
                  </Button>
                )}
                
                {/* Admin Panel for admins */}
                {user.type === 'admin' && (
                  <Link to="/admin">
                    <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover hidden sm:flex">
                      Admin Panel
                    </Button>
                  </Link>
                )}
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
                <Link to="/login">
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
                  
                  {user.verified !== false && user.type !== 'admin' && (
                    <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover justify-start">
                      <Plus className="w-4 h-4 mr-1" />
                      Post Blog
                    </Button>
                  )}
                  
                  {user.type === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="default" size="sm" className="bg-accent hover:bg-accent-hover w-full justify-start">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              {!user && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-text-primary">
                      Login
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
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
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Home, Users, Mail, Bell, Search, Menu, Settings, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useTranslation } from 'react-i18next';
import GlassSurface from './GlassSurface';

interface NavbarProps {
  onMessagesClick?: () => void;
}

export const Navbar = ({ onMessagesClick }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("search") || "");
  
  const isActive = (path: string) => location.pathname === path;

  // Update local search query when URL params change
  useEffect(() => {
    setLocalSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    
    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newSearchParams.set("search", value);
    } else {
      newSearchParams.delete("search");
    }
    setSearchParams(newSearchParams);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <GlassSurface 
        width={1200} 
        height={80}
        borderRadius={40}
        displace={15}
        distortionScale={-150}
        redOffset={5}
        greenOffset={15}
        blueOffset={25}
        brightness={60}
        opacity={0.8}
        mixBlendMode="screen"
        className="w-full max-w-6xl"
      >
        <div className="flex items-center h-full px-8">
          
          {/* Left Section: GRADNET Text */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/" className="flex-shrink-0">
              <span className="text-white text-2xl font-bold">GRADNET</span>
            </Link>
            
            {/* Search Bar - only show for authenticated users */}
            {user && (
              <div className="relative w-48 lg:w-72 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                <Input
                  placeholder={t('nav.search')}
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-transparent border-white/30 focus:bg-transparent text-white placeholder:text-white/70"
                />
              </div>
            )}
          </div>

          {/* Center Section: Home and About Links */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'text-white bg-white/20' : 'text-white hover:text-white/80'
                }`}
              >
                <Home className="w-4 h-4" />
                {t('nav.home')}
              </Link>
              <Link 
                to="/about" 
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/about') ? 'text-white bg-white/20' : 'text-white hover:text-white/80'
                }`}
              >
                <Users className="w-4 h-4" />
                {t('nav.about')}
              </Link>
            </div>
          </div>

          {/* Right Section: Language + Auth Buttons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:text-white/80"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Sign Up/Login buttons for non-authenticated users */}
            {!user && (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-white/80">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    {t('nav.signUp')}
                  </Button>
                </Link>
              </>
            )}

            {/* User profile for authenticated users */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full text-white hover:text-white/80">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.profilePicture || undefined}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {getInitials(user.firstName, user.lastName)}
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
                    {t('nav.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/20">
            <div className="flex flex-col space-y-3 px-4">
              {/* Show Home and About only for non-authenticated users */}
              {!user && (
                <>
                  <Link 
                    to="/" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/') ? 'bg-white/20 text-white' : 'text-white hover:text-white/80'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    {t('nav.home')}
                  </Link>
                  <Link 
                    to="/about" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/about') ? 'bg-white/20 text-white' : 'text-white hover:text-white/80'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    {t('nav.about')}
                  </Link>
                </>
              )}
              
              {/* Show Dashboard and Network only for authenticated users */}
              {user && (
                <>
                  <Link 
                    to="/feed" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/feed') ? 'bg-white/20 text-white' : 'text-white hover:text-white/80'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link 
                    to="/network" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/network') ? 'bg-white/20 text-white' : 'text-white hover:text-white/80'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    {t('nav.network')}
                  </Link>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 justify-start"
                    onClick={() => {
                      navigate("/create-post");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('nav.createPost')}
                  </Button>
                </>
              )}
              
              {/* Show Login/Register only for non-authenticated users */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-2">
                  {location.pathname === '/cu-questions' ? (
                    // Special buttons for CU Questions page (prospective students)
                    <>
                      <Link to="/prospective-login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-text-primary">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/prospective-student" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="default" className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                          Join CU Community
                        </Button>
                      </Link>
                    </>
                  ) : (
                    // Regular buttons for other pages
                    <>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-text-secondary hover:text-text-primary">
                          {t('nav.signIn')}
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="default" className="w-full justify-start bg-accent hover:bg-accent-hover">
                          {t('nav.signUp')}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassSurface>
    </nav>
  );
};
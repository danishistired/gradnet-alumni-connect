import logoSvg from "../assets/logo.svg";
import newLogoSvg from "../assets/new logo.svg";
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
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });
  const homeRef = useRef<HTMLAnchorElement>(null);
  const aboutRef = useRef<HTMLAnchorElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  
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

  // Update active indicator position
  useEffect(() => {
    const updateActiveIndicator = () => {
      // Only show indicator for non-authenticated users on Home/About pages
      if (user) {
        setActiveIndicator({ left: 0, width: 0 });
        return;
      }
      
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
  }, [location.pathname, user]);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 border-b border-border z-50 ${location.pathname === '/' || location.pathname === '/about' || location.pathname === '/login' || location.pathname === '/register' ? 'bg-black' : 'bg-surface'}`}>
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Section: Logo + Search */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/" className="flex-shrink-0">
              <img 
                src={location.pathname === '/' || location.pathname === '/about' || location.pathname === '/login' || location.pathname === '/register' ? logoSvg : newLogoSvg} 
                alt="GRADNET Logo" 
                className="h-12 w-auto" 
              />
            </Link>
            
            {/* Search Bar - only show for authenticated users */}
            {user && (
              <div className="relative w-64 lg:w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder={t('nav.search')}
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-surface-muted border-border focus:bg-surface"
                />
              </div>
            )}
          </div>

          {/* Center Section: Navigation Links */}
          <div ref={navContainerRef} className="hidden md:flex items-center justify-center flex-1 absolute left-1/2 transform -translate-x-1/2">
            {/* Sliding Active Indicator - only show for non-authenticated users */}
            {!user && (
              <div 
                className="absolute top-2 bottom-2 bg-accent-light rounded-lg transition-all duration-300 ease-in-out z-0 shadow-sm"
                style={{
                  left: `${activeIndicator.left}px`,
                  width: `${activeIndicator.width}px`,
                  opacity: (isActive('/') || isActive('/about')) ? 1 : 0,
                  transform: `translateZ(0)` // Force hardware acceleration
                }}
              />
            )}
            
            <div className="flex items-center space-x-8 relative">
              {/* Show Home and About only for non-authenticated users */}
              {!user && (
                <>
                  <Link 
                    ref={homeRef}
                    to="/" 
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    {t('nav.home')}
                  </Link>
                  <Link 
                    ref={aboutRef}
                    to="/about" 
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/about') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                    }`}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/feed') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link 
                    to="/network" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive('/network') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {t('nav.network')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Right Section: Actions + Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            
            {user && (
              <>
                {/* Post Blog Button */}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-accent hover:bg-accent-hover hidden lg:flex"
                  onClick={() => navigate("/create-post")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('nav.createPost')}
                </Button>

                {/* Action Buttons */}
                <div className="hidden sm:flex items-center gap-3">
                  {/* Language Selector - only show on feed page */}
                  {location.pathname === '/feed' && <LanguageSelector />}

                  {/* Notifications Dropdown */}
                  <NotificationsDropdown />

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
                </div>

                {/* Profile Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
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
              </>
            )}
            
            {/* Sign Up/Login buttons for non-authenticated users */}
            {!user && (
              <div className="flex items-center gap-3">
                {location.pathname === '/cu-questions' ? (
                  // Special buttons for CU Questions page (prospective students)
                  <>
                    <Link to="/prospective-login">
                      <Button variant="ghost" className={`${
                        isActive('/prospective-login') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                      }`}>
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/prospective-student">
                      <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                        Join CU Community
                      </Button>
                    </Link>
                  </>
                ) : (
                  // Regular buttons for other pages
                  <>
                    <Link to="/login">
                      <Button variant="ghost" className={`${
                        isActive('/login') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                      }`}>
                        {t('nav.signIn')}
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="default" className="bg-accent hover:bg-accent-hover">
                        {t('nav.signUp')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {/* Show Home and About only for non-authenticated users */}
              {!user && (
                <>
                  <Link 
                    to="/" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    {t('nav.home')}
                  </Link>
                  <Link 
                    to="/about" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/about') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
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
                      isActive('/feed') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link 
                    to="/network" 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/network') ? 'bg-accent-light text-accent' : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    {t('nav.network')}
                  </Link>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-accent hover:bg-accent-hover justify-start"
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
                        <Button variant="ghost" className={`w-full justify-start ${
                          isActive('/prospective-login') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                        }`}>
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
                        <Button variant="ghost" className={`w-full justify-start ${
                          isActive('/login') ? 'text-black bg-gray-300' : 'text-white hover:text-gray-200'
                        }`}>
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
      </div>
    </nav>
  );
};
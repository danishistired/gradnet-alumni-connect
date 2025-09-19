import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      title: 'Dashboard',
      path: '/admin-dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Alumni Management',
      path: '/admin-dashboard',
      icon: Users,
      hash: '#alumni'
    },
    {
      title: 'Verification Queue',
      path: '/admin-dashboard',
      icon: UserCheck,
      hash: '#verification'
    },
    {
      title: 'Events',
      path: '/admin-dashboard',
      icon: Calendar,
      hash: '#events'
    },
    {
      title: 'Analytics',
      path: '/admin-dashboard',
      icon: BarChart3,
      hash: '#analytics'
    },
    {
      title: 'Settings',
      path: '/admin-settings',
      icon: Settings,
    }
  ];

  const isActive = (path: string, hash?: string) => {
    if (hash) {
      return currentPath === path && window.location.hash === hash;
    }
    return currentPath === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    window.location.href = '/admin';
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-bold">Admin Portal</h2>
            <p className="text-sm text-muted-foreground">GradNet</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.hash);
            
            return (
              <Link
                key={item.title}
                to={item.path + (item.hash || '')}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
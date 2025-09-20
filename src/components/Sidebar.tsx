import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Hash,
  Star,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  displayName: string;
  description: string;
  memberCount: number;
  postCount: number;
  icon: string;
  createdAt: string;
}

export const Sidebar = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchCommunities();
    fetchJoinedCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/communities');
      const data = await response.json();
      if (data.success) {
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const fetchJoinedCommunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/communities/joined', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setJoinedCommunities(data.communities);
      }
    } catch (error) {
      console.error('Failed to fetch joined communities:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: HelpCircle, label: 'CU Community', path: '/community-qa' },
    { icon: Users, label: 'All Communities', path: '/communities' },
  ];

  // Show top communities and joined ones
  const displayedCommunities = showAllCommunities 
    ? communities 
    : communities.slice(0, 5);

  const myJoinedCommunities = communities.filter(c => 
    joinedCommunities.includes(c.id)
  );

  return (
    <div className="w-64 h-[calc(100vh-4rem)] bg-background border-r border-border flex flex-col fixed left-0 top-16 z-10">
      {/* Main Navigation */}
      <div className="p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(item.path)
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <Separator />

      {/* My Communities */}
      {myJoinedCommunities.length > 0 && (
        <div className="px-4 py-2 max-h-48 flex flex-col">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            My Communities
          </h3>
          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-4">
              {myJoinedCommunities.map((community) => (
                <Link
                  key={community.id}
                  to={`/g/${community.name}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group",
                    isActive(`/g/${community.name}`)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{community.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {community.memberCount}
                  </Badge>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <Separator />

      {/* Popular Communities */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Popular Communities
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCommunities(!showAllCommunities)}
              className="h-6 w-6 p-0"
            >
              {showAllCommunities ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 px-4 pb-4 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 pr-4">
              {displayedCommunities.map((community) => (
                <Link
                  key={community.id}
                  to={`/g/${community.name}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group",
                    isActive(`/g/${community.name}`)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{community.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {community.memberCount} members
                    </div>
                  </div>
                  {joinedCommunities.includes(community.id) && (
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  )}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Create Community Button */}
      <div className="p-4 border-t border-border">
        <Link to="/create-community">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            Create Community
          </Button>
        </Link>
      </div>
    </div>
  );
};

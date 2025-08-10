import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '@/contexts/CommunityContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { 
  Users, 
  Search, 
  Plus, 
  TrendingUp, 
  Calendar,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AllCommunities = () => {
  const { communities, joinedCommunities, joinCommunity, leaveCommunity, loading } = useCommunity();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('members'); // members, name, recent
  const [filterBy, setFilterBy] = useState('all'); // all, joined, not-joined
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Filter and sort communities
  const filteredCommunities = communities
    .filter(community => {
      const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          community.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'joined') {
        return matchesSearch && joinedCommunities.includes(community.id);
      } else if (filterBy === 'not-joined') {
        return matchesSearch && !joinedCommunities.includes(community.id);
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return b.memberCount - a.memberCount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleJoinLeave = async (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      await leaveCommunity(communityId);
    } else {
      await joinCommunity(communityId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative w-full min-h-screen">
          <Sidebar />
          <div className="w-full overflow-auto flex justify-center">
            <div className="w-full max-w-6xl p-6 pt-20">
              <div className="text-center py-12">
                <p className="text-text-secondary">Loading communities...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative w-full min-h-screen">
        <Sidebar />
        <div className="w-full overflow-auto flex justify-center">
          <div className="w-full max-w-6xl p-6 pt-20">
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">All Communities</h1>
                  <p className="text-text-secondary mt-1">
                    Discover and join communities that match your interests
                  </p>
                </div>
                
                <Link to="/create-community">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Community
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-primary">{communities.length}</p>
                        <p className="text-sm text-text-secondary">Total Communities</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-primary">{joinedCommunities.length}</p>
                        <p className="text-sm text-text-secondary">Communities Joined</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text-primary">
                          {communities.reduce((sum, c) => sum + c.memberCount, 0)}
                        </p>
                        <p className="text-sm text-text-secondary">Total Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Most Members</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="recent">Recently Created</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Communities</SelectItem>
                    <SelectItem value="joined">Joined</SelectItem>
                    <SelectItem value="not-joined">Not Joined</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Communities Grid/List */}
            {filteredCommunities.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No Communities Found</h3>
                  <p className="text-text-secondary mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to create a community!'}
                  </p>
                  <Link to="/create-community">
                    <Button>Create First Community</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredCommunities.map((community) => {
                  const isJoined = joinedCommunities.includes(community.id);
                  
                  return (
                    <Card key={community.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                              {community.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                <Link 
                                  to={`/g/${community.name}`}
                                  className="hover:text-accent transition-colors"
                                >
                                  {community.displayName || community.name}
                                </Link>
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <Users className="h-3 w-3" />
                                <span>{community.memberCount} members</span>
                                <span>•</span>
                                <span>Created {formatDate(community.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {isJoined && (
                            <Badge variant="secondary" className="text-xs">
                              Joined
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm text-text-secondary mb-4 line-clamp-2">
                          {community.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {community.postCount} posts
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link to={`/g/${community.name}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            
                            {user && (
                              <Button
                                size="sm"
                                variant={isJoined ? "secondary" : "default"}
                                onClick={() => handleJoinLeave(community.id, isJoined)}
                              >
                                {isJoined ? 'Leave' : 'Join'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

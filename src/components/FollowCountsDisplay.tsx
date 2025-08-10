import { useState, useEffect } from "react";
import { useFollow, FollowCounts } from "@/contexts/FollowContext";

interface FollowCountsDisplayProps {
  userId: string;
  className?: string;
}

export const FollowCountsDisplay = ({ userId, className = "" }: FollowCountsDisplayProps) => {
  const { getFollowCounts, followDataVersion } = useFollow();
  const [counts, setCounts] = useState<FollowCounts>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const followCounts = await getFollowCounts(userId);
        setCounts(followCounts);
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCounts();
    }
  }, [userId, getFollowCounts, followDataVersion]); // Add followDataVersion to dependencies

  if (loading) {
    return (
      <div className={`flex gap-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="text-sm">
        <span className="font-semibold">{counts.followersCount}</span>
        <span className="text-text-secondary ml-1">
          {counts.followersCount === 1 ? 'Follower' : 'Followers'}
        </span>
      </div>
      <div className="text-sm">
        <span className="font-semibold">{counts.followingCount}</span>
        <span className="text-text-secondary ml-1">Following</span>
      </div>
    </div>
  );
};

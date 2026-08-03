import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCheckIsFollowingQuery,
} from "@/services/api/usersApi";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  username: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean, newFollowersCount: number) => void;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  username,
  initialIsFollowing,
  onFollowChange,
  className = "",
}) => {
  const { toast } = useToast();

  // Use the query to check if we're following, skip if initialIsFollowing is provided
  const { data: isFollowingQuery, isLoading: isChecking } = useCheckIsFollowingQuery(
    username,
    { skip: initialIsFollowing !== undefined }
  );

  const [followUser, { isLoading: isFollowingAction }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingAction }] = useUnfollowUserMutation();

  const [localIsFollowing, setLocalIsFollowing] = useState<boolean>(
    initialIsFollowing ?? false
  );

  // Sync local state if query finishes or initialIsFollowing changes
  useEffect(() => {
    if (initialIsFollowing !== undefined) {
      setLocalIsFollowing(initialIsFollowing);
    } else if (isFollowingQuery !== undefined) {
      setLocalIsFollowing(isFollowingQuery);
    }
  }, [initialIsFollowing, isFollowingQuery]);

  const isLoading = isChecking || isFollowingAction || isUnfollowingAction;

  const handleToggleFollow = async () => {
    try {
      let result;
      if (localIsFollowing) {
        result = await unfollowUser(username).unwrap();
        setLocalIsFollowing(false);
      } else {
        result = await followUser(username).unwrap();
        setLocalIsFollowing(true);
      }

      if (result?.success) {
        onFollowChange?.(
          result.data.following,
          result.data.followers_count
        );
      }
    } catch (error) {
      console.error("Failed to toggle follow status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${localIsFollowing ? "unfollow" : "follow"} ${username}. Please try again.`,
      });
      // Optionally revert local state here if optimistic update fails
    }
  };

  return (
    <Button
      variant={localIsFollowing ? "outline" : "default"}
      size="sm"
      className={`min-w-[100px] transition-all duration-300 ${
        localIsFollowing 
          ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" 
          : "hover:scale-105"
      } ${className}`}
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : localIsFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  );
};

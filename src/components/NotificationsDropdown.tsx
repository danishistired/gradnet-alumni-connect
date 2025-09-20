import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Check, CheckCheck, UserPlus, Shield, AlertTriangle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { contentModerationSystem, type UserWarning } from "@/utils/contentModeration";
import { formatDistanceToNow } from "date-fns";

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'follow':
      return <UserPlus className="w-4 h-4 text-blue-500" />;
    case 'moderation':
      return <Shield className="w-4 h-4 text-orange-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export const NotificationsDropdown = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [moderationWarnings, setModerationWarnings] = useState<UserWarning[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Load moderation warnings
  useEffect(() => {
    if (user?.id) {
      loadModerationWarnings();
      // Set up interval to check for new warnings
      const interval = setInterval(loadModerationWarnings, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Update total unread count
  useEffect(() => {
    const unreadWarnings = moderationWarnings.filter(w => !w.isRead).length;
    setTotalUnreadCount(unreadCount + unreadWarnings);
  }, [unreadCount, moderationWarnings]);

  const loadModerationWarnings = () => {
    if (!user?.id) return;
    const userWarnings = contentModerationSystem.getUserWarnings(user.id);
    setModerationWarnings(userWarnings);
  };

  const markWarningAsRead = (warningId: string) => {
    contentModerationSystem.markWarningAsRead(warningId);
    loadModerationWarnings();
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Mark all moderation warnings as read
    moderationWarnings.forEach(warning => {
      if (!warning.isRead) {
        contentModerationSystem.markWarningAsRead(warning.id);
      }
    });
    loadModerationWarnings();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {/* Show different icons based on content type */}
          {moderationWarnings.some(w => !w.isRead) && unreadCount > 0 ? (
            <div className="relative">
              <Bell className="w-4 h-4" />
              <Shield className="w-3 h-3 absolute -top-1 -right-1 text-orange-500" />
            </div>
          ) : moderationWarnings.some(w => !w.isRead) ? (
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0 backdrop-blur-md bg-white/90 border border-white/20 shadow-xl"
        sideOffset={5}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {totalUnreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 && moderationWarnings.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">When someone follows you, you'll see it here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/50">
              {/* Moderation Warnings */}
              {moderationWarnings.map((warning) => (
                <div
                  key={warning.id}
                  className={`p-3 mx-3 my-2 rounded-lg border-l-4 ${
                    warning.severity === 'high' 
                      ? 'bg-red-50 border-red-400' 
                      : warning.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-blue-50 border-blue-400'
                  } ${!warning.isRead ? 'shadow-md' : 'opacity-75'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        warning.severity === 'high' 
                          ? 'text-red-500' 
                          : warning.severity === 'medium'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold ${
                            warning.severity === 'high' 
                              ? 'text-red-700' 
                              : warning.severity === 'medium'
                              ? 'text-yellow-700'
                              : 'text-blue-700'
                          }`}>
                            Content Warning
                          </span>
                          {!warning.isRead && (
                            <div className={`w-2 h-2 rounded-full ${
                              warning.severity === 'high' 
                                ? 'bg-red-500' 
                                : warning.severity === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`} />
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mt-1">
                          {warning.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(warning.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {!warning.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markWarningAsRead(warning.id)}
                        className="h-6 w-6 p-0 hover:bg-white/50"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Regular Notifications */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={notification.fromUserAvatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {getInitials(
                          notification.fromUserName.split(' ')[0] || '',
                          notification.fromUserName.split(' ')[1] || ''
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <NotificationIcon type={notification.type} />
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-900 mt-1">
                        <span className="font-medium">{notification.fromUserName}</span>{' '}
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Mark as read button for unread notifications */}
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="w-3 h-3 text-gray-400" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200/50 bg-gray-50/50">
            <p className="text-xs text-center text-gray-500">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

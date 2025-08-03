'use client';

import { Activity } from '@/lib/api/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconMail,
  IconPhone,
  IconUsers,
  IconNotes,
  IconEdit,
  IconPlus,
  IconUser,
  IconClock,
  IconArrowRight,
} from '@tabler/icons-react';

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <IconMail className="h-4 w-4" />;
      case 'call':
        return <IconPhone className="h-4 w-4" />;
      case 'meeting':
        return <IconUsers className="h-4 w-4" />;
      case 'note':
        return <IconNotes className="h-4 w-4" />;
      case 'status_change':
        return <IconArrowRight className="h-4 w-4" />;
      case 'created':
        return <IconPlus className="h-4 w-4" />;
      case 'updated':
        return <IconEdit className="h-4 w-4" />;
      case 'assigned':
        return <IconUser className="h-4 w-4" />;
      default:
        return <IconClock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      email: "bg-blue-100 text-blue-800 border-blue-200",
      call: "bg-green-100 text-green-800 border-green-200",
      meeting: "bg-purple-100 text-purple-800 border-purple-200",
      note: "bg-yellow-100 text-yellow-800 border-yellow-200",
      status_change: "bg-orange-100 text-orange-800 border-orange-200",
      created: "bg-gray-100 text-gray-800 border-gray-200",
      updated: "bg-gray-100 text-gray-800 border-gray-200",
      assigned: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconClock className="mr-2 h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activities recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Activities like emails, calls, and status changes will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <IconClock className="mr-2 h-5 w-5" />
          Activity Timeline
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-6 bg-border" />
              )}
              
              {/* Activity item */}
              <div className="flex space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground">
                        {activity.subject}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end text-xs text-muted-foreground">
                      <span>{formatActivityDate(activity.activity_date)}</span>
                      <span>{formatFullDate(activity.activity_date)}</span>
                    </div>
                  </div>
                  
                  {activity.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    <IconUser className="mr-1 h-3 w-3" />
                    {activity.user.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
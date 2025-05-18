export interface Notification {
  id: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd';
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  campaign?: string;
  fileDetails?: {
    name: string;
    size: string;
  };
  timeAgo: string;
}
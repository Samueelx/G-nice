import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useUserSearch } from '@/hooks/useUserSearch';
import { SearchUser } from '@/types/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface MentionInputBaseProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

function useMentionLogic(value: string, onChange: (value: string) => void) {
  const [mentionActive, setMentionActive] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const { users, isLoading, searchUsers, clearUsers } = useUserSearch();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.substring(0, cursorPosition);

    // Find the last @ before the cursor
    const lastAtMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);

    if (lastAtMatch) {
      setMentionActive(true);
      setMentionQuery(lastAtMatch[1]);
      setMentionStartIndex(cursorPosition - lastAtMatch[0].length);
      searchUsers(lastAtMatch[1]);
    } else {
      setMentionActive(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
      clearUsers();
    }
  };

  const handleSelectUser = (user: SearchUser) => {
    if (mentionStartIndex === -1) return;

    const textBeforeMention = value.substring(0, mentionStartIndex);
    const textAfterMention = value.substring(mentionStartIndex + mentionQuery.length + 1); // +1 for the @

    const newValue = `${textBeforeMention}@${user.username} ${textAfterMention}`;
    onChange(newValue);

    setMentionActive(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
    clearUsers();

    // Set focus back
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = textBeforeMention.length + user.username.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const renderDropdown = () => {
    if (!mentionActive) return null;

    return (
      <div className="absolute z-50 w-full md:w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto top-full left-0">
        {isLoading && (
          <div className="p-3 flex justify-center items-center text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
          </div>
        )}
        {!isLoading && users.length === 0 && mentionQuery.length > 0 && (
          <div className="p-3 text-sm text-gray-500 text-center">No users found</div>
        )}
        {!isLoading && users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 p-2 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
            onClick={() => handleSelectUser(user)}
          >
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{(user.display_name || user.username).charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 leading-tight">{user.display_name || user.username}</span>
              <span className="text-xs text-gray-500 leading-tight">@{user.username}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return { inputRef, handleInputChange, renderDropdown };
}

export const MentionTextarea: React.FC<MentionInputBaseProps> = ({ value, onChange, ...props }) => {
  const { inputRef, handleInputChange, renderDropdown } = useMentionLogic(value, onChange);

  return (
    <div className="relative w-full">
      <Textarea
        ref={inputRef as any}
        value={value}
        onChange={handleInputChange}
        {...(props as any)}
      />
      {renderDropdown()}
    </div>
  );
};

export const MentionInput: React.FC<MentionInputBaseProps> = ({ value, onChange, ...props }) => {
  const { inputRef, handleInputChange, renderDropdown } = useMentionLogic(value, onChange);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef as any}
        value={value}
        onChange={handleInputChange}
        {...(props as any)}
      />
      {renderDropdown()}
    </div>
  );
};

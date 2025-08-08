import React from 'react';
import {
  Chat,
  Language,
  Groups,
  Campaign, // or AutoAwesomeMotion for Channels
  Settings,
} from '@mui/icons-material';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User , Circle} from 'lucide-react';

const navItems = [
  { key: 'chats', icon: <Chat fontSize="medium" />, label: 'Chats' },
  { key: 'status', icon: <Language fontSize="medium" />, label: 'Status' },
  { key: 'communities', icon: <Groups fontSize="medium" />, label: 'Communities' },
  { key: 'channels', icon: <Campaign fontSize="medium" />, label: 'Channels' },
];

export const SidebarNav: React.FC<{ active?: string; onSelect?: (key: string) => void }> = ({
  active = 'chats',
  onSelect,
}) => {
  return (
    <nav className="flex flex-col justify-between items-center py-4 bg-[#f0f2f5] border-r border-gray-300 w-[72px] min-h-screen">

      {/* Top nav buttons */}
      <div className="flex flex-col items-center gap-4 mt-2">
        {navItems.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`p-2 rounded-full transition-colors duration-200 ${active === key
              ? 'bg-[#25D366] text-white'
              : 'hover:bg-[#e6e6e6] text-gray-600'
              }`}
            onClick={() => onSelect?.(key)}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Bottom settings + profile */}
      <div className="flex flex-col items-center gap-6 mb-2">
        {/* Settings */}
        <button
          className="p-2 rounded-full hover:bg-[#e6e6e6] text-gray-600 transition-colors duration-200"
          title="Settings"
        >
          <Settings fontSize="medium" />
        </button>

        {/* Profile Avatar */}
        <Avatar className="w-7 h-7">
          {/* <AvatarImage src={user.profile_pic_url} /> */}
          <AvatarFallback className="bg-white text-gray-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.315 0-10 1.658-10 5v3h20v-3c0-3.342-6.685-5-10-5z" />
            </svg>
          </AvatarFallback>


        </Avatar>


      </div>
    </nav>
  );
};

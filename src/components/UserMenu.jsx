import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StaggeredMenu } from './ui/StaggeredMenu';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const createNewProject = async (closeMenu) => {
    const newProjectId = Date.now().toString(); // Fallback
    try {
      const currentUser = user?.username || user?.name || "anonymous";
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/create/${encodeURIComponent(currentUser)}`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      
      if (response.ok) {
        const newProject = await response.json();
        closeMenu();
        setTimeout(() => {
          navigate('/board', { state: { showLoader: true, projectId: newProject.id, projectName: newProject.name } });
        }, 300);
        return;
      }
    } catch (error) {
      console.error("Failed to initialize board in backend", error);
    }

    closeMenu();
    setTimeout(() => {
      navigate('/board', { state: { showLoader: true, projectId: newProjectId, projectName: "Untitled Board" } });
    }, 300);
  };

  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home', link: '/' },
    { label: 'Dashboard', ariaLabel: 'View dashboard', link: '/dashboard' },
    { label: 'New Board', ariaLabel: 'Create new board', onClick: createNewProject },
    { label: 'Share', ariaLabel: 'Share your boards', link: '/share' },
    { label: 'Settings', ariaLabel: 'Manage settings', link: '/settings' }
  ];

  const CreativeLogout = ({ closeMenu }) => (
    <button 
      onClick={() => {
        closeMenu();
        setTimeout(() => {
          logout();
          if (location.pathname !== '/') {
            navigate('/');
            alert('You have been successfully logged out.');
          }
        }, 700);
      }}
      className="sm-logout-btn mt-8 flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-950/30 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all group overflow-hidden relative"
    >
      <span className="relative z-10 font-bold uppercase tracking-widest text-sm">Log Out</span>
      <span className="relative z-10 opacity-50 group-hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </span>
      <span className="absolute inset-0 bg-red-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    </button>
  );

  const AvatarTrigger = (
    <button type="button" className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-yellow)]">
      <img 
        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`} 
        alt="User avatar" 
        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      />
      <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate text-black dark:text-white">
        {user?.name || 'User'}
      </span>
    </button>
  );

  return (
    <div className="relative">
      <StaggeredMenu
        position="right"
        colors={['var(--color-charcoal)', 'var(--color-yellow)', 'var(--color-white)']}
        accentColor="var(--color-yellow)"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering={true}
        customTrigger={AvatarTrigger}
        footerContent={CreativeLogout}
      />
    </div>
  );
};

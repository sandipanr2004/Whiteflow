import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Clock, Users, Search, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CrowdCanvas } from '../components/CrowdCanvas';
import { ShareModal } from '../components/ShareModal';
import styles from './Collaborate.module.css';

export const Share = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('share');

  useEffect(() => {
    fetchBoards();
  }, [user]);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const currentUser = user?.username || user?.name || 'anonymous';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/user/${encodeURIComponent(currentUser)}`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
      if (res.ok) {
        const data = await res.json();
        const backendProjects = data;
        backendProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBoards(backendProjects);
      }
    } catch (err) {
      console.error('Failed to fetch boards', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBoards = boards.filter(board => 
    board.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>

      <div className={`${styles.contentWrapper} relative z-10 w-full max-w-5xl mx-auto px-6 py-12`}>
        
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>
            Share your <span className={styles.highlight}>boards</span>
          </h1>
          <p className={styles.subtitle}>
            Manage access and invite teammates to collaborate in real-time.
          </p>
        </motion.div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 min-h-[500px]">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FolderOpen size={24} className="text-blue-500" />
              My Workspaces
            </h2>
            
            <div className="relative w-full sm:w-72">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search boards..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-800 dark:text-gray-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Boards List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              <p className="text-gray-500 font-medium animate-pulse">Loading boards...</p>
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <FolderOpen size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No boards found</h3>
              <p className="text-gray-500 max-w-md">
                {searchQuery ? "No boards match your search query." : "You haven't created any boards yet. Go to your dashboard to create one!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredBoards.map((board, index) => (
                  <motion.div
                    key={board.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                        {board.name?.substring(0, 2).toUpperCase() || 'WB'}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{board.name || 'Untitled Board'}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                          <span className="flex items-center gap-1"><Clock size={12}/> {new Date(board.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedTab('members');
                          setSelectedBoardId(board.id);
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-gray-200 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                      >
                        <Users size={18} />
                        Members
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedTab('share');
                          setSelectedBoardId(board.id);
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-blue-600 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-blue-500 dark:hover:text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                      >
                        <Share2 size={18} />
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedBoardId && (
          <ShareModal 
            isOpen={!!selectedBoardId} 
            onClose={() => setSelectedBoardId(null)} 
            boardId={selectedBoardId} 
            initialTab={selectedTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

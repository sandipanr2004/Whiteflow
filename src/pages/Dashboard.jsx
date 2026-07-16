import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Clock, Plus, BarChart3, Settings, Search, Bell, Star, Share2, MoreVertical, ExternalLink, ArrowRight, Lock, Globe, Users as UsersIcon, CheckCircle2, Clock3, Download, Trash2 } from 'lucide-react';
import { Whiteboard } from '../components/Whiteboard';
import { CrowdCanvas } from '../components/CrowdCanvas';
import styles from './Dashboard.module.css';

const DashboardCard = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={`${styles.card} ${className}`}
  >
    {children}
  </motion.div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [exportsList, setExportsList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const navigate = useNavigate();

  // Load projects from backend on mount
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded from AuthContext
    
    let isMounted = true;
    
    const fetchProjects = async () => {
      try {
        const currentUser = user.username || user.name;
        if (!currentUser) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/user/${encodeURIComponent(currentUser)}`, {
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          // Projects are strictly from the backend database
          const backendProjects = data.reverse();
          setProjects(backendProjects);
        }
      } catch (e) {
        console.error("Failed to fetch projects from backend", e);
      }
    };
    fetchProjects();

    const fetchExports = async () => {
      try {
        const currentUser = user.username || user.name;
        if (!currentUser) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exports/user/${encodeURIComponent(currentUser)}`, {
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        if (response.ok && isMounted) {
          const data = await response.json();
          setExportsList(data);
        }
      } catch (err) {
        console.error("Failed to fetch exports", err);
      }
    };
    fetchExports();
    
    return () => { isMounted = false; };
  }, [user]);



  const createNewProject = async () => {
    try {
      const currentUser = user?.username || user?.name || "anonymous";
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/create/${encodeURIComponent(currentUser)}`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      
      if (response.ok) {
        const newProject = await response.json();
        const updatedProjects = [newProject, ...projects];
        setProjects(updatedProjects);
        navigate('/board', { state: { showLoader: true, projectId: newProject.id, projectName: newProject.name } });
        return;
      }
    } catch (error) {
      console.error("Failed to initialize board in backend", error);
    }

    // Fail loudly if backend is unreachable, do NOT fall back to in-memory board
    alert("Cannot create board. The server is currently unreachable. Please try again later.");
  };
  
  const toggleFavorite = (projectId, e) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(projectId)
      ? favorites.filter(id => id !== projectId)
      : [...favorites, projectId];
    setFavorites(newFavorites);
  };

  const deleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this board?")) return;
    
    // Optimistic UI update
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/boards/${projectId}`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to delete board on server", err);
    }
  };
  
  return (
    <div className={`${styles.dashboardContainer} relative overflow-hidden`}>
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className={`${styles.header} relative z-10`}
      >
        <div>
          <h1 className={styles.title}>
            <span className={styles.highlight}>{user?.name || user?.username || 'Creator'}'s Workspace</span>
          </h1>
          <p className={styles.subtitle}>Here's what's happening with your projects today.</p>
        </div>

      </motion.div>

      {/* Recent Projects */}
      <motion.div 
        className={`${styles.projectsSection} relative z-10`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <div className="flex gap-4 items-center">
            <h2 className={styles.sectionTitle}>Recent Projects</h2>
            {projects.length > 0 && (
              <>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewProject} 
                  className="flex items-center justify-center gap-1.5 bg-[var(--color-yellow)] text-black px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  <Plus size={16} /> New Project
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStarredOnly(!showStarredOnly)} 
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-semibold transition-opacity cursor-pointer text-sm border ${showStarredOnly ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <Star size={16} fill={showStarredOnly ? "currentColor" : "none"} /> {showStarredOnly ? "All Boards" : "Starred"}
                </motion.button>
              </>
            )}
          </div>
          {projects.length > 0 && <a href="#" className={styles.viewAll}>View all</a>}
        </div>
        
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/10 text-center">
            <h3 className="text-2xl font-bold font-display uppercase tracking-wider mb-2">Start your journey</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">You haven't created any whiteboards yet. Start your first project to unlock the power of real-time collaboration!</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createNewProject} 
              className="h-12 px-8 rounded-full flex items-center justify-center gap-2 bg-[var(--color-yellow)] text-black font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus size={20} /> Create Your First Project
            </motion.button>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.filter(p => showStarredOnly ? favorites.includes(p.id) : true).map((project, i) => (
              <motion.div 
                key={project.id} 
                className={styles.projectCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.3 + (i * 0.1),
                  hover: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                {/* Top Thumbnail Section (60%) */}
                <div className={styles.thumbnailContainer}>
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    /* Scale the whiteboard to look like a mini preview and disable interactions */
                    <div style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left', pointerEvents: 'none', overflow: 'hidden' }}>
                      <Whiteboard isThumbnail={true} persistenceKey={project.id.toString()} />
                    </div>
                  )}
                  <div className={styles.thumbnailOverlay}>
                    <button className={styles.continueButton} onClick={() => navigate('/board', { state: { showLoader: true, projectId: project.id.toString(), projectName: project.name } })}>
                      Continue Editing <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Bottom Details Section (40%) */}
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.projectName} title={project.name}>{project.name}</h3>
                  </div>
                  <p className={styles.projectDesc}>{project.desc}</p>
                  
                  <div className={styles.metaRow}>
                    <div className={styles.badges}>
                      <span className={`${styles.badgePill} ${project.status === 'Active' ? styles.badgeActive : project.status === 'Review' ? styles.badgeReview : styles.badgeArchived}`}>
                        {project.status === 'Active' ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                        {project.status}
                      </span>
                      <span className={`${styles.badgePill} ${project.visibility === 'Private' ? styles.badgePrivate : project.visibility === 'Shared' ? styles.badgeShared : styles.badgeArchived}`}>
                        {project.visibility === 'Private' ? <Lock size={12} /> : project.visibility === 'Shared' ? <UsersIcon size={12} /> : <Globe size={12} />}
                        {project.visibility}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
                      whileTap={{ scale: 0.95 }}
                      className={styles.openBoardBtn} 
                      onClick={() => navigate('/board', { state: { showLoader: true, projectId: project.id.toString(), projectName: project.name } })}
                    >
                      <ExternalLink size={16} />
                      Open Board
                    </motion.button>
                    <div className={styles.actionLeft}>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 15 }} 
                        whileTap={{ scale: 0.9 }} 
                        className={styles.actionBtn} 
                        title={favorites.includes(project.id) ? "Unfavorite" : "Favorite"}
                        onClick={(e) => toggleFavorite(project.id, e)}
                      >
                        <Star size={18} fill={favorites.includes(project.id) ? "#F2555A" : "none"} color={favorites.includes(project.id) ? "#F2555A" : "currentColor"} />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        className={styles.actionBtn} 
                        title="Delete Board"
                        onClick={(e) => deleteProject(project.id, e)}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Saved Exports */}
      <motion.div 
        className={`${styles.projectsSection} relative z-10 mt-12 mb-20`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className={styles.sectionHeader}>
          <div className="flex gap-4 items-center">
            <h2 className={styles.sectionTitle}>Saved Exports</h2>
          </div>
        </div>
        
        {exportsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/10 text-center">
            <p className="text-gray-500 dark:text-gray-400">No exports found. Export a whiteboard to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {exportsList.map((filename, i) => (
              <motion.div 
                key={i} 
                className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col"
                whileHover={{ y: -5 }}
              >
                <div className="p-8 flex-grow flex items-center justify-center bg-gray-50 dark:bg-zinc-900/50">
                  <Download size={40} className="text-gray-300 dark:text-gray-600" />
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-zinc-800">
                  <span className="text-sm font-semibold truncate pr-2 dark:text-gray-200" title={filename}>
                    {filename.split('.').pop().toUpperCase()} Export 
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      {new Date(parseInt(filename.split('_')[0])).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </span>
                  <a 
                    href={`/api/exports/user/${user?.username || user?.name || "anonymous"}/${filename}`} 
                    download
                    target="_blank"
                    className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

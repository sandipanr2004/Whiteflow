import React, { useState, useEffect, useRef } from 'react';
import { Tldraw, exportAs, createShapeId, DefaultColorStyle, DefaultMainMenu, DefaultMainMenuContent, TldrawUiMenuItem, TldrawUiMenuGroup, DefaultGrid, useValue } from 'tldraw';
import '@tldraw/tldraw/tldraw.css';
import { ChevronLeft, Download, Eraser, Trash2, PenTool, MousePointerSquareDashed, Save, Check, Copy, Wand2, Users, Crown, Grip, Grid, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CustomStyleToolbar } from './CustomStyleToolbar';
import { CustomTextToolbar } from './CustomTextToolbar';
import { PenSizePopup } from './PenSizePopup';
import { ShareModal } from './ShareModal';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';

const customTranslations = {
  en: {
    'custom.export-pdf': 'Export as PDF',
    'custom.share': 'Share',
    'custom.save-board': 'Save Board',
    'custom.saved': 'Saved!',
    'custom.saving': 'Saving...',
    'custom.host': ' (Host)',
    'custom.room-full': 'Room is full! Max 5 participants.'
  },
  mr: {
    'custom.export-pdf': 'PDF म्हणून निर्यात करा',
    'custom.share': 'शेअर करा',
    'custom.save-board': 'बोर्ड सेव्ह करा',
    'custom.saved': 'सेव्ह झाले!',
    'custom.saving': 'सेव्ह होत आहे...',
    'custom.host': ' (होस्ट)',
    'custom.room-full': 'खोली पूर्ण भरली आहे! जास्तीत जास्त 5 सहभागी.'
  },
  hi: {
    'custom.export-pdf': 'PDF के रूप में निर्यात करें',
    'custom.share': 'साझा करें',
    'custom.save-board': 'बोर्ड सहेजें',
    'custom.saved': 'सहेजा गया!',
    'custom.saving': 'सहेजा जा रहा है...',
    'custom.host': ' (होस्ट)',
    'custom.room-full': 'कमरा भर गया है! अधिकतम 5 प्रतिभागी.'
  },
  fr: {
    'custom.export-pdf': 'Exporter en PDF',
    'custom.share': 'Partager',
    'custom.save-board': 'Enregistrer le tableau',
    'custom.saved': 'Enregistré !',
    'custom.saving': 'Enregistrement...',
    'custom.host': ' (Hôte)',
    'custom.room-full': 'La salle est pleine ! Max 5 participants.'
  }
};

const overrides = {
  translations: customTranslations
};

export const Whiteboard = ({ isThumbnail = false, isDemoEnded = false, isDemo = false, persistenceKey = 'default-board', projectName = 'Untitled Board' }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem(`board_theme_${persistenceKey}`) || 'white');

  useEffect(() => {
    try {
      localStorage.setItem(`board_theme_${persistenceKey}`, theme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  }, [theme, persistenceKey]);
  const [editor, setEditor] = useState(null);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    if (!editor) return;

    const translateDefaultPageName = (newLocale) => {
      const defaultNames = ['Page 1', 'पृष्ठ 1', 'Página 1'];
      const targetName = newLocale.startsWith('mr') ? 'पृष्ठ 1' : 
                         newLocale.startsWith('hi') ? 'पृष्ठ 1' : 
                         newLocale.startsWith('es') ? 'Página 1' : 'Page 1';
      
      const pages = editor.getPages();
      pages.forEach(page => {
        if (defaultNames.includes(page.name) && page.name !== targetName) {
          editor.renamePage(page.id, targetName);
        }
      });
    };

    setLocale(editor.user.getLocale());
    translateDefaultPageName(editor.user.getLocale());

    const unsubscribe = editor.store.listen(() => {
      const currentLocale = editor.user.getLocale();
      setLocale((prev) => {
        if (prev !== currentLocale) {
          translateDefaultPageName(currentLocale);
          return currentLocale;
        }
        return prev;
      });
    });
    return () => unsubscribe();
  }, [editor]);

  const t = (key) => {
    const lang = locale.split('-')[0];
    if (customTranslations[lang] && customTranslations[lang][key]) {
      return customTranslations[lang][key];
    }
    return customTranslations['en'][key];
  };

  const [isEraserMenuOpen, setIsEraserMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [roomFull, setRoomFull] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [bgPattern, setBgPattern] = useState('dots'); // 'blank', 'dots', 'grid'
  const presenceClientRef = useRef(null);


  const handleCopyCode = () => {
    const shareUrl = `${window.location.origin}/board/${persistenceKey}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  useEffect(() => {
    if (editor) {
      const guestName = sessionStorage.getItem('guestName');
      const currentName = user?.name || user?.username || guestName || 'Guest';
      editor.user.updateUserPreferences({
        colorScheme: theme === 'white' ? 'light' : 'dark',
        name: currentName
      });
    }
  }, [theme, editor, user]);

  // Room presence tracking
  useEffect(() => {
    if (!persistenceKey || isThumbnail || isDemoEnded || isDemo) return;

    const guestName = sessionStorage.getItem('guestName');
    const userId = user?.username || user?.name || (guestName ? `guest-${guestName}` : `guest-${Date.now()}`);
    const userName = user?.name || user?.username || guestName || 'Guest';

    const presenceClient = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws-board`),
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to presence updates
        presenceClient.subscribe(`/topic/room/presence/${persistenceKey}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data.type === 'ROOM_FULL') {
              setRoomFull(true);
              return;
            }
            if (data.users) {
              setConnectedUsers(data.users);
            }
          } catch (e) {
            console.error("Error parsing presence:", e);
          }
        });

        // Announce join
        presenceClient.publish({
          destination: `/app/room/join/${persistenceKey}`,
          body: JSON.stringify({ userId, userName })
        });
      }
    });

    presenceClient.activate();
    presenceClientRef.current = presenceClient;

    return () => {
      // Announce leave
      try {
        if (presenceClient.connected) {
          presenceClient.publish({
            destination: `/app/room/leave/${persistenceKey}`,
            body: JSON.stringify({ userId })
          });
        }
      } catch (e) {}
      presenceClient.deactivate();
    };
  }, [persistenceKey, isThumbnail, isDemoEnded, isDemo, user]);

  // Real-time synchronization via STOMP WebSocket
  useEffect(() => {
    if (!editor || !persistenceKey || isThumbnail || isDemoEnded || isDemo) return;

    let client = null;
    let isConnected = false;

    const handleRemoteChange = (message) => {
      try {
        const changes = JSON.parse(message.body);
        const added = Object.values(changes.added || {});
        const updated = Object.values(changes.updated || {}).map(([, to]) => to);
        const removed = Object.values(changes.removed || {});

        editor.store.mergeRemoteChanges(() => {
          if (added.length > 0) editor.store.put(added);
          if (updated.length > 0) editor.store.put(updated);
          if (removed.length > 0) editor.store.remove(removed.map(r => r.id));
        });
      } catch (e) {
        console.error("Error merging remote changes:", e);
      }
    };

    client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws-board`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        isConnected = true;
        console.log("Connected to room:", persistenceKey);
        client.subscribe(`/topic/room/${persistenceKey}`, handleRemoteChange);

        client.subscribe(`/topic/room/sync-request/${persistenceKey}`, (msg) => {
           const shapeIds = Array.from(editor.getCurrentPageShapeIds());
            if (shapeIds.length > 0) {
              const snapshot = editor.getSnapshot();
              if (client && client.connected) {
                client.publish({
                  destination: `/app/draw/sync-response/${persistenceKey}`,
                  body: JSON.stringify(snapshot)
                });
              }
            }
        });
        
        client.subscribe(`/topic/room/sync-response/${persistenceKey}`, (msg) => {
           try {
             const snapshot = JSON.parse(msg.body);
             if (snapshot && (snapshot.store || (snapshot.document && snapshot.document.store))) {
               editor.loadSnapshot(snapshot);
             }
           } catch(e) { console.error("Error loading snapshot", e); }
        });
        
        setTimeout(() => {
          if (isConnected && client && client.connected) {
            client.publish({ destination: `/app/draw/sync-request/${persistenceKey}`, body: "SYNC" });
          }
        }, 500);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    client.activate();

    let pendingChanges = { added: {}, updated: {}, removed: {} };
    let syncTimeout = null;

    const unsubscribe = editor.store.listen(
      (update) => {
        if (update.source === 'user' && isConnected && client) {
          Object.assign(pendingChanges.added, update.changes.added);
          Object.assign(pendingChanges.updated, update.changes.updated);
          Object.assign(pendingChanges.removed, update.changes.removed);

          if (!syncTimeout) {
            syncTimeout = setTimeout(() => {
              if (isConnected && client && client.connected) {
                client.publish({
                  destination: `/app/draw/${persistenceKey}`,
                  body: JSON.stringify(pendingChanges),
                });
              }
              pendingChanges = { added: {}, updated: {}, removed: {} };
              syncTimeout = null;
            }, 32); // ~30fps batching
          }
        }
      },
      { source: 'user', scope: 'document' }
    );

    return () => {
      unsubscribe();
      if (client) client.deactivate();
    };
  }, [editor, persistenceKey, isThumbnail, isDemoEnded, isDemo]);

  // Auto-save board state to PostgreSQL every 10 seconds
  useEffect(() => {
    if (!editor || !persistenceKey || isThumbnail || isDemoEnded || isDemo) return;

    const autoSaveInterval = setInterval(() => {
      const shapeIds = Array.from(editor.getCurrentPageShapeIds());
      if (shapeIds.length === 0) return; // Don't save empty boards

      const boardData = {
        id: persistenceKey,
        name: projectName,
        date: new Date().toISOString(),
        status: "Active",
        visibility: "Private",
        desc: "Auto-saved",
        collaborators: connectedUsers.length || 1,
        snapshot: JSON.stringify(editor.getSnapshot()),
        owner: user?.username || user?.name || "anonymous"
      };

      fetch(`${import.meta.env.VITE_API_URL}/api/boards`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify(boardData)
      }).catch(err => console.warn("Auto-save failed:", err));
    }, 10000); // Every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editor, persistenceKey, isThumbnail, isDemoEnded, isDemo, projectName, user, connectedUsers]);


  const handleMount = (editor) => {
    setEditor(editor);

    // Fetch existing board state from PostgreSQL
    const loadFromDatabase = () => {
      if (!persistenceKey) return Promise.resolve(false);
      
      return fetch(`${import.meta.env.VITE_API_URL}/api/boards/${persistenceKey}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Board not found');
        })
        .then(data => {
          if (data && data.snapshot) {
            try {
              const snapshot = JSON.parse(data.snapshot);
              if (snapshot && (snapshot.store || (snapshot.document && snapshot.document.store))) {
                editor.loadSnapshot(snapshot);
                
                // Ensure drawings are visible by zooming to fit
                setTimeout(() => {
                  if (editor.getCurrentPageShapeIds().size > 0) {
                    editor.zoomToFit({ animation: { duration: 0 } });
                  }
                }, 100);

                console.log("Board loaded from database successfully.");
                return true;
              }
            } catch (e) {
              console.error("Failed to parse snapshot from DB", e);
            }
          }
          return false;
        })
        .catch(err => {
          console.log("No existing board state found in DB, starting fresh.");
          return false;
        });
    };

    // First attempt: load from database immediately
    loadFromDatabase().then(loaded => {
      if (!loaded) {
        // Second attempt: retry after 3 seconds (host's auto-save may have run by then)
        setTimeout(() => {
          loadFromDatabase().then(loadedRetry => {
            if (!loadedRetry) {
              console.log("Retry: still no data in DB. Waiting for live sync...");
            }
          });
        }, 3000);
      }
    });
    
    editor.updateInstanceState({ isGridMode: true });
    if (isThumbnail) {
      setTimeout(() => {
        try {
          editor.zoomToFit({ animation: { duration: 0 } });
        } catch (e) {}
      }, 100);
    }
  };

  const handleExport = async (format) => {
    if (!editor) return;
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) {
      alert("There are no shapes to export!");
      return;
    }
    
    // Export exactly what the user currently sees on their screen (the whole page viewport)
    const bounds = editor.getViewportPageBounds();

    if (format === 'pdf') {
      const { blob } = await editor.toImage(shapeIds, { format: 'png', background: true, bounds });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height]
        });
        pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
        pdf.save(`whiteboard-export-${Date.now()}.pdf`);
        
        const pdfBlob = pdf.output('blob');
        const currentUser = user?.username || user?.name || "anonymous";
        const formData = new FormData();
        formData.append('file', pdfBlob, `whiteboard-export-${Date.now()}.pdf`);
        
        fetch(`${import.meta.env.VITE_API_URL}/api/exports/user/${encodeURIComponent(currentUser)}`, { headers: { 'Bypass-Tunnel-Reminder': 'true' }, 
          method: 'POST',
          body: formData
         }).catch(err => console.error("Failed to upload PDF export", err));

        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else {
      exportAs(editor, shapeIds, { format, background: true, bounds });
      
      const { blob } = await editor.toImage(shapeIds, { format, background: true, bounds });
      const currentUser = user?.username || user?.name || "anonymous";
      const formData = new FormData();
      formData.append('file', blob, `whiteboard-export-${Date.now()}.${format}`);
      
      fetch(`${import.meta.env.VITE_API_URL}/api/exports/user/${encodeURIComponent(currentUser)}`, { headers: { 'Bypass-Tunnel-Reminder': 'true' }, 
        method: 'POST',
        body: formData
       }).catch(err => console.error("Failed to upload image export", err));
    }
  };

  const handleSaveToBackend = async () => {
    if (!editor) return;
    setIsSaving(true);
    
    try {
      let base64Thumbnail = "";
      const shapeIds = Array.from(editor.getCurrentPageShapeIds());
      
      // Try generating thumbnail, but don't let it block the save
      if (shapeIds.length > 0) {
        try {
          const bounds = editor.getViewportPageBounds();
          const { blob } = await editor.toImage(shapeIds, { format: 'jpeg', background: true, bounds });
          const reader = new FileReader();
          base64Thumbnail = await new Promise((resolve, reject) => {
             reader.onloadend = () => resolve(reader.result);
             reader.onerror = () => resolve(""); // Fail gracefully
             reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Thumbnail generation failed (tainted canvas?), saving without thumbnail.", e);
          // Continue without thumbnail — this is fine
        }
      }

      const boardData = {
        id: persistenceKey,
        name: projectName,
        date: new Date().toISOString(),
        status: "Active",
        visibility: "Private",
        desc: "Saved from whiteboard",
        collaborators: connectedUsers.length || 1,
        thumbnail: base64Thumbnail,
        snapshot: JSON.stringify(editor.getSnapshot()),
        owner: user?.username || user?.name || "anonymous"
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/boards`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify(boardData)
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        console.error('Failed to save to backend, status:', response.status);
        alert('Failed to save board. Please try again.');
      }
    } catch (error) {
      console.error('Error saving board:', error);
      alert('Error saving board: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const setManualEraser = () => {
    if (!editor) return;
    editor.setCurrentTool('eraser');
    setIsEraserMenuOpen(false);
  };

  const setObjectEraser = () => {
    if (!editor) return;
    editor.setCurrentTool('eraser');
    setIsEraserMenuOpen(false);
  };

  const clearBoard = () => {
    if (!editor) return;
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.deleteShapes(shapeIds);
    setIsEraserMenuOpen(false);
  };



  const components = {
    Background: () => {
      const camera = useValue('camera', () => editor?.getCamera(), [editor]);
      const x = camera?.x || 0;
      const y = camera?.y || 0;
      const z = camera?.z || 1;
      
      const size = 32 * z;
      const strokeColor = theme === 'white' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
      
      const bgStyle = bgPattern === 'grid' ? {
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${x}px ${y}px`,
        backgroundImage: `linear-gradient(to right, ${strokeColor} 1px, transparent 1px), linear-gradient(to bottom, ${strokeColor} 1px, transparent 1px)`
      } : {};

      return (
        <div 
          style={{ 
            backgroundColor: theme === 'green' ? '#06482D' : theme === 'black' ? '#121212' : theme === 'pink' ? '#DB2777' : '#F8F9FA', 
            width: '100%', 
            height: '100%', 
            position: 'absolute', 
            inset: 0,
            pointerEvents: 'none',
            ...bgStyle
          }} 
        />
      );
    },
    Grid: (props) => {
      if (bgPattern === 'blank' || bgPattern === 'grid') return null;
      return <DefaultGrid {...props} />;
    },
    StylePanel: () => null,
    MainMenu: () => (
      <DefaultMainMenu>
        <DefaultMainMenuContent />
        <TldrawUiMenuGroup id="custom-export">
          <TldrawUiMenuItem
            id="export-pdf"
            label="custom.export-pdf"
            icon="external-link"
            readonlyOk
            onSelect={() => handleExport('pdf')}
          />
        </TldrawUiMenuGroup>
      </DefaultMainMenu>
    ),
  };

  return (
    <div 
      className="w-full h-full flex-1 relative tldraw-theme-wrapper overflow-hidden" 
      style={{ zIndex: 1, isolation: 'isolate' }}
    >
      {theme === 'green' && (
        <style>{`
          .tldraw-theme-wrapper .tl-container {
            --color-background: #06482D !important;
            --color-grid: rgba(255, 255, 255, 0.15) !important;
          }
          .tldraw-theme-wrapper .tl-container [data-color="white"] {
            stroke: #06482D !important;
            fill: #06482D !important;
            color: #06482D !important;
          }
        `}</style>
      )}
      {theme === 'black' && (
        <style>{`
          .tldraw-theme-wrapper .tl-container {
            --color-background: #121212 !important;
            --color-grid: rgba(255, 255, 255, 0.08) !important;
          }
          .tldraw-theme-wrapper .tl-container [data-color="white"] {
            stroke: #121212 !important;
            fill: #121212 !important;
            color: #121212 !important;
          }
        `}</style>
      )}
      {theme === 'pink' && (
        <style>{`
          .tldraw-theme-wrapper .tl-container {
            --color-background: #DB2777 !important;
            --color-grid: rgba(255, 255, 255, 0.7) !important;
          }
          .tldraw-theme-wrapper .tl-container [data-color="white"] {
            stroke: #DB2777 !important;
            fill: #DB2777 !important;
            color: #DB2777 !important;
          }
        `}</style>
      )}
      {theme === 'white' && (
        <style>{`
          .tldraw-theme-wrapper .tl-container [data-color="white"] {
            stroke: #F8F9FA !important;
            fill: #F8F9FA !important;
            color: #F8F9FA !important;
          }
        `}</style>
      )}

      <style>{`
        .tl-watermark, 
        [data-testid*="watermark"], 
        a[href*="tldraw.dev"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .tl-container {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      <Tldraw 
        hideUi={isThumbnail || isDemoEnded || sessionStorage.getItem(`board_access_${persistenceKey}`) === 'VIEW_ONLY'}
        isReadOnly={isThumbnail || isDemoEnded || sessionStorage.getItem(`board_access_${persistenceKey}`) === 'VIEW_ONLY'}
        onMount={handleMount}
        components={components}
        overrides={overrides}
      />

      {!(isThumbnail || isDemoEnded) && (
        <>
          {/* Pattern Selector */}
          <div className="absolute bottom-[280px] left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-3 z-[40]">
            <button 
              onClick={() => setBgPattern('blank')} 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${bgPattern === 'blank' ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm' : 'text-gray-500 hover:scale-105 hover:bg-gray-100'} transition-all`} 
              title="Blank" 
            >
              <Ban size={18} />
            </button>
            <button 
              onClick={() => setBgPattern('dots')} 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${bgPattern === 'dots' ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm' : 'text-gray-500 hover:scale-105 hover:bg-gray-100'} transition-all`} 
              title="Dots" 
            >
              <Grip size={18} />
            </button>
            <button 
              onClick={() => setBgPattern('grid')} 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${bgPattern === 'grid' ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm' : 'text-gray-500 hover:scale-105 hover:bg-gray-100'} transition-all`} 
              title="Grid Lines" 
            >
              <Grid size={18} />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="absolute bottom-20 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-3 z-[40]">
            <button 
              onClick={() => setTheme('white')} 
              className={`w-8 h-8 rounded-full border-2 ${theme === 'white' ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:scale-105'} bg-[#F8F9FA] transition-all`} 
              title="Whiteboard" 
            />
            <button 
              onClick={() => setTheme('green')} 
              className={`w-8 h-8 rounded-full border-2 ${theme === 'green' ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'} bg-[#06482D] transition-all`} 
              title="Greenboard" 
            />
            <button 
              onClick={() => setTheme('black')} 
              className={`w-8 h-8 rounded-full border-2 ${theme === 'black' ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'} bg-[#121212] transition-all`} 
              title="Blackboard" 
            />
            <button 
              onClick={() => setTheme('pink')} 
              className={`w-8 h-8 rounded-full border-2 ${theme === 'pink' ? 'border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'} bg-[#DB2777] transition-all`} 
              title="Pinkboard" 
            />
          </div>

          {/* Connected Users Display & Share Button */}
          {connectedUsers.length > 0 && !isDemo && (
            <div className="absolute top-4 right-4 z-[9999] flex items-center gap-2">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 transition-colors"
              >
                <Users size={16} /> {t('custom.share')}
              </button>
              
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-2">
                <Users size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{connectedUsers.length}/5</span>
                <div className="flex -space-x-2 ml-1">
                  {connectedUsers.map((u, i) => (
                    <div 
                      key={u.userId || i}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-black shadow-sm relative group"
                      style={{ backgroundColor: u.color || ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6'][i % 5] }}
                      title={u.userName || u.userId}
                    >
                      {(u.userName || u.userId || '?').charAt(0).toUpperCase()}
                      {i === 0 && (
                        <Crown size={8} className="absolute -top-1.5 -right-0.5 text-yellow-500 drop-shadow" />
                      )}
                      {/* Tooltip */}
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {u.userName || u.userId}{i === 0 ? t('custom.host') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {isShareModalOpen && (
              <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                boardId={persistenceKey} 
              />
            )}
          </AnimatePresence>

          {/* Room Full Banner */}
          <AnimatePresence>
            {roomFull && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 z-[99999]"
              >
                <Users size={18} />
                {t('custom.room-full')}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button (Bottom Right) */}
          {!isDemo && sessionStorage.getItem(`board_access_${persistenceKey}`) !== 'VIEW_ONLY' && (
            <div className="absolute bottom-4 right-4 z-[9999] flex gap-3">

              
              <button 
                onClick={handleSaveToBackend}
                disabled={isSaving}
                className={`bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex items-center gap-2 font-bold text-sm transition-all ${
                  saveSuccess ? 'text-green-500 border-green-500' : 'text-gray-700 dark:text-gray-300 hover:scale-105 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                }`}
              >
                {saveSuccess ? (
                  <><Check size={16} /> {t('custom.saved')}</>
                ) : isSaving ? (
                  <><span className="animate-spin text-lg">⏳</span> {t('custom.saving')}</>
                ) : (
                  <><Save size={16} /> {t('custom.save-board')}</>
                )}
              </button>
            </div>
          )}


          {/* Collapsible Eraser Menu (Right Side) */}
          {sessionStorage.getItem(`board_access_${persistenceKey}`) !== 'VIEW_ONLY' && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center z-[9999] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)" 
              style={{ transform: isEraserMenuOpen ? 'translateX(-1rem)' : 'translateX(calc(100% - 3rem))' }}
            >
              <button 
                onClick={() => setIsEraserMenuOpen(!isEraserMenuOpen)}
                className="mr-3 bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0 cursor-pointer"
                title="Advanced Eraser Options"
              >
                {isEraserMenuOpen ? <ChevronLeft size={20} className="rotate-180" /> : <Eraser size={20} />}
              </button>
              
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-2.5 w-36">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 self-center tracking-widest uppercase mb-1">Erase Mode</span>
                
                <button onClick={setManualEraser} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800/80 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-xl transition-all shadow-sm w-full text-left">
                  <PenTool size={14} /> Manual
                </button>
                
                <button onClick={setObjectEraser} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800/80 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-xl transition-all shadow-sm w-full text-left">
                  <MousePointerSquareDashed size={14} /> Object
                </button>
                
                <div className="h-px w-full bg-gray-200 dark:bg-white/10 my-0.5"></div>
                
                <button onClick={clearBoard} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all shadow-sm w-full text-left">
                  <Trash2 size={14} /> Clear All
                </button>
              </div>
            </div>
          )}
          
          {/* Saved Toast Popup */}
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 z-[99999]"
              >
                <Check size={20} />
                Board Saved Successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {sessionStorage.getItem(`board_access_${persistenceKey}`) !== 'VIEW_ONLY' && (
            <>
              {/* Custom Style Toolbar */}
              <CustomStyleToolbar editor={editor} />
              
              {/* Custom Text Toolbar */}
              <CustomTextToolbar editor={editor} />

              {/* Pen Size Popup for bottom toolbar */}
              <PenSizePopup editor={editor} />
            </>
          )}

        </>
      )}
    </div>
  );
};

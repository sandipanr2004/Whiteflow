const fs = require('fs');
let content = fs.readFileSync('src/components/Whiteboard.jsx', 'utf8');

content = content.replace(
  "import { Tldraw, exportAs, createShapeId, DefaultColorStyle, DefaultMainMenu, DefaultMainMenuContent, TldrawUiMenuItem, TldrawUiMenuGroup } from 'tldraw';",
  "import { Tldraw, exportAs, createShapeId, DefaultColorStyle, DefaultMainMenu, DefaultMainMenuContent, TldrawUiMenuItem, TldrawUiMenuGroup, DefaultGrid } from 'tldraw';"
);

content = content.replace(
  "import { ChevronLeft, Download, Eraser, Trash2, PenTool, MousePointerSquareDashed, Save, Check, Copy, Wand2, Users, Crown } from 'lucide-react';",
  "import { ChevronLeft, Download, Eraser, Trash2, PenTool, MousePointerSquareDashed, Save, Check, Copy, Wand2, Users, Crown, Grip, Grid, Ban } from 'lucide-react';"
);

content = content.replace(
  "const [isShareModalOpen, setIsShareModalOpen] = useState(false);",
  "const [isShareModalOpen, setIsShareModalOpen] = useState(false);\n  const [bgPattern, setBgPattern] = useState('dots'); // 'blank', 'dots', 'grid'"
);

content = content.replace(
  "editor.updateInstanceState({ isGridMode: true });\n    }\n  }, [editor, isThumbnail, isDemoEnded, isDemo]);",
  "editor.updateInstanceState({ isGridMode: bgPattern !== 'blank' });\n    }\n  }, [editor, isThumbnail, isDemoEnded, isDemo, bgPattern]);"
);

const oldBg = `Background: () => (
      <div 
        style={{ 
          backgroundColor: theme === 'green' ? '#06482D' : theme === 'black' ? '#121212' : theme === 'pink' ? '#DB2777' : '#F8F9FA', 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          inset: 0,
          pointerEvents: 'none'
        }} 
      />
    ),
    StylePanel: () => null,`;

const newBg = `Background: () => (
      <div 
        style={{ 
          backgroundColor: theme === 'green' ? '#06482D' : theme === 'black' ? '#121212' : theme === 'pink' ? '#DB2777' : '#F8F9FA', 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          inset: 0,
          pointerEvents: 'none'
        }} 
      />
    ),
    Grid: (props) => {
      if (bgPattern === 'blank') return null;
      if (bgPattern === 'dots') return <DefaultGrid {...props} />;
      
      const { x, y, z } = props;
      const size = 32 * z;
      return (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
           <defs>
              <pattern id="cheque-grid" x={x} y={y} width={size} height={size} patternUnits="userSpaceOnUse">
                 <path d={\`M \${size} 0 L 0 0 0 \${size}\`} fill="none" stroke="var(--color-grid)" strokeWidth={1} />
              </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#cheque-grid)" />
        </svg>
      )
    },
    StylePanel: () => null,`;
content = content.replace(oldBg, newBg);

const oldButtons = `{/* Theme Selector */}
          <div className="absolute bottom-20 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-3 z-[40]">`;

const newButtons = `{/* Pattern Selector */}
          <div className="absolute bottom-56 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-3 z-[40]">
            <button 
              onClick={() => setBgPattern('blank')} 
              className={\`w-8 h-8 rounded-full flex items-center justify-center \${bgPattern === 'blank' ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm' : 'text-gray-500 hover:scale-105 hover:bg-gray-100'} transition-all\`} 
              title="Blank" 
            >
              <Ban size={18} />
            </button>
            <button 
              onClick={() => setBgPattern('dots')} 
              className={\`w-8 h-8 rounded-full flex items-center justify-center \${bgPattern === 'dots' ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm' : 'text-gray-500 hover:scale-105 hover:bg-gray-100'} transition-all\`} 
              title="Dots" 
            >
              <Grip size={18} />
            </button>
            <button 
              onClick={() => setBgPattern('grid')} 
              className={\`w-8 h-8 rounded-full flex items-center justify-center \${bgPattern === 'grid' ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm' : 'text-gray-500 hover:scale-105 hover:bg-gray-100'} transition-all\`} 
              title="Grid Lines" 
            >
              <Grid size={18} />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="absolute bottom-20 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-3 z-[40]">`;
content = content.replace(oldButtons, newButtons);

fs.writeFileSync('src/components/Whiteboard.jsx', content);

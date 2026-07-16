import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Palette, Bell, Shield, LogOut, Check, Eye, EyeOff, Settings as SettingsIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Settings.module.css';
import { useNavigate } from 'react-router-dom';
import ThemeToggleButton from '../components/ThemeToggle';

export const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const maleSeeds = ['Felix', 'Jack', 'Oliver', 'James', 'William', 'Leo', 'Lucas', 'Mason', 'Ethan', 'Alexander'];
  const femaleSeeds = ['Mia', 'Sophia', 'Olivia', 'Emma', 'Ava', 'Isabella', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'];
  const predefinedAvatars = [...maleSeeds, ...femaleSeeds].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);

  // Form states
  const [name, setName] = useState(user?.name || 'Jane Doe');
  const [email, setEmail] = useState(user?.username || 'jane@example.com');

  React.useEffect(() => {
    if (user) {
      setName(user.name || 'User');
      let displayEmail = user.email;
      if (!displayEmail) {
        if (user.username && user.username.includes('@')) {
          displayEmail = user.username;
        } else {
          displayEmail = `${(user.name || 'user').replace(/\s+/g, '').toLowerCase()}@example.com`;
        }
      }
      setEmail(displayEmail);
    }
  }, [user]);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const success = await updateUser({ name, username: email, email });
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.15, ease: 'easeIn' } }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <h2 className={styles.sectionTitle}>Profile Info</h2>
            <p className={styles.sectionDesc}>Update your photo and personal details here.</p>
            
            <form onSubmit={handleSave}>
              <div className={styles.avatarUpload}>
                <div className={styles.avatarCircle}>
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="Profile" className={styles.avatarImg} />
                </div>
                <div>
                  <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)} className={styles.btnSecondary} style={{ marginRight: '1rem' }}>Change Avatar</button>
                </div>
              </div>

              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl p-4 shadow-sm relative">
                      <button 
                        type="button"
                        onClick={() => setShowAvatarPicker(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Choose an Avatar</h4>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                        {predefinedAvatars.map((url, index) => (
                          <div 
                            key={index}
                            onClick={() => {
                              updateUser({ avatar: url });
                              setShowAvatarPicker(false);
                            }}
                            className={`cursor-pointer rounded-full p-1 transition-all ${user?.avatar === url ? 'ring-2 ring-[var(--color-yellow)] bg-gray-100 dark:bg-black/50' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                          >
                            <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-auto rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input} 
                  placeholder="Your full name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input} 
                  placeholder="your.email@example.com"
                />
              </div>

              <button type="submit" className={styles.btnPrimary}>
                {saveSuccess ? <span className="flex items-center gap-2"><Check size={18} /> Saved!</span> : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        );

      case 'appearance':
        return (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.15, ease: 'easeIn' } }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <h2 className={styles.sectionTitle}>Appearance</h2>
            <p className={styles.sectionDesc}>Customize how WhiteFlow looks on your device.</p>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4>Theme Mode</h4>
                <p>Toggle between Light and Dark mode globally.</p>
              </div>
              <div>
                <ThemeToggleButton />
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.15, ease: 'easeIn' } }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <h2 className={styles.sectionTitle}>Notifications</h2>
            <p className={styles.sectionDesc}>We'll let you know when important things happen.</p>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4>Email Notifications</h4>
                <p>Receive daily summaries and invite alerts.</p>
              </div>
              <div 
                className={`${styles.toggleSwitch} ${notifications.email ? styles.active : ''}`} 
                onClick={() => setNotifications({...notifications, email: !notifications.email})}
              >
                <div className={styles.toggleKnob}></div>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4>Push Notifications</h4>
                <p>Get instant alerts when someone joins your board.</p>
              </div>
              <div 
                className={`${styles.toggleSwitch} ${notifications.push ? styles.active : ''}`} 
                onClick={() => setNotifications({...notifications, push: !notifications.push})}
              >
                <div className={styles.toggleKnob}></div>
              </div>
            </div>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4>Marketing Emails</h4>
                <p>Receive tips, news, and product updates.</p>
              </div>
              <div 
                className={`${styles.toggleSwitch} ${notifications.marketing ? styles.active : ''}`} 
                onClick={() => setNotifications({...notifications, marketing: !notifications.marketing})}
              >
                <div className={styles.toggleKnob}></div>
              </div>
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, transition: { duration: 0.15, ease: 'easeIn' } }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            <h2 className={styles.sectionTitle}>Security</h2>
            <p className={styles.sectionDesc}>Manage your password and active sessions.</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={showCurrentPassword ? "Enter current password" : "••••••••"} 
                  className={styles.input} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                  className="absolute right-12 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={showNewPassword ? "Enter new password" : "••••••••"} 
                  className={styles.input} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)} 
                  className="absolute right-12 top-1/2 -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button className={styles.btnSecondary} style={{ marginBottom: '3rem' }}>Update Password</button>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Decorative Rotating Gears */}
      <div className={`absolute top-[5%] left-[5%] opacity-[0.15] dark:opacity-10 text-gray-800 dark:text-white z-0 pointer-events-none ${styles.gear1}`}>
        <SettingsIcon size={400} />
      </div>
      <div className={`absolute bottom-[-10%] right-[-5%] opacity-[0.1] dark:opacity-10 text-gray-800 dark:text-white z-0 pointer-events-none ${styles.gear2}`}>
        <SettingsIcon size={600} />
      </div>
      <div className={`absolute top-[40%] right-[20%] opacity-[0.12] dark:opacity-10 text-gray-800 dark:text-white z-0 pointer-events-none ${styles.gear3}`}>
        <SettingsIcon size={200} />
      </div>

      {/* Decorative gradient blobs behind content */}
      <div className="absolute top-[20%] left-[10%] w-[40rem] h-[40rem] bg-gradient-to-tr from-yellow-300/20 to-orange-400/20 rounded-full blur-[120px] -z-10 pointer-events-none dark:hidden"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-300/20 to-purple-400/20 rounded-full blur-[100px] -z-10 pointer-events-none dark:hidden"></div>

      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            ACCOUNT <span className={styles.highlight}>Settings</span>
          </h1>
          <p className={styles.subtitle}>
            Manage your personal preferences, security details, and how WhiteFlow looks for you.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar Navigation */}
          <div className={styles.sidebar}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={styles.tabIndicator}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={styles.tabContent} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <tab.icon size={18} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className={styles.contentArea}>
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

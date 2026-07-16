import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // For testing, we check local storage to persist state across reloads
  useEffect(() => {
    const savedUser = localStorage.getItem('whiteflow_user');
    if (savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle OAuth2 redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    
    if (token && username) {
      const displayName = username.split('@')[0];
      const realUser = {
        username,
        name: displayName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
        token: token
      };
      
      setIsLoggedIn(true);
      setUser(realUser);
      try {
        localStorage.setItem('whiteflow_user', JSON.stringify(realUser));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }
      showToast(`Welcome back, ${realUser.name}!`);
      
      // Redirect to home page
      window.location.href = '/';
    }
  }, []);

  const login = async (username, password, turnstileToken, isSignup = false) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true', 
          'Content-Type': 'application/json',
          'CF-Turnstile-Response': turnstileToken || ''
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        showToast(data.message || 'Login failed');
        return false;
      }
      
      const displayName = username.split('@')[0];
      const realUser = {
        username,
        name: displayName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
        token: data.token
      };
      
      setIsLoggedIn(true);
      setUser(realUser);
      try {
        localStorage.setItem('whiteflow_user', JSON.stringify(realUser));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }
      
      if (isSignup) {
        showToast(`Welcome ${realUser.name}!`);
      } else {
        showToast(`Welcome back, ${realUser.name}!`);
      }
      
      return true;
    } catch (error) {
      showToast('Error connecting to server.');
      return false;
    }
  };

  const signup = async (username, email, password, turnstileToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true', 
          'Content-Type': 'application/json',
          'CF-Turnstile-Response': turnstileToken || ''
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        showToast(data.message || 'Signup failed');
        return false;
      }
      
      return await login(username, password, turnstileToken, true);
    } catch (error) {
      showToast('Error connecting to server.');
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('whiteflow_user');
    showToast('You have successfully logged out.');
  };

  const updateUser = async (updates) => {
    try {
      const oldUsername = user?.username;
      const newUsername = updates.username || oldUsername;
      
      if (oldUsername) {
        // 1. Update in auth backend
        const authRes = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/profile/${encodeURIComponent(oldUsername)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
          body: JSON.stringify(updates)
        });
        
        if (!authRes.ok) {
           const errData = await authRes.json();
           showToast(errData.message || 'Failed to update profile');
           return false;
        }

        // 2. If username changed, update board backend owners
        if (newUsername !== oldUsername) {
           await fetch(`${import.meta.env.VITE_API_URL}/api/boards/updateOwner?oldOwner=${encodeURIComponent(oldUsername)}&newOwner=${encodeURIComponent(newUsername)}`, {
             method: 'PUT',
             headers: { 'Bypass-Tunnel-Reminder': 'true' }
           });
        }
      }

      setUser(prev => {
        const updatedUser = { ...prev, ...updates };
        localStorage.setItem('whiteflow_user', JSON.stringify(updatedUser));
        return updatedUser;
      });
      showToast('Profile updated successfully.');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Error updating profile.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, signup, updateUser }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-8 right-8 z-[9999] bg-[var(--color-charcoal)] text-white dark:bg-white dark:text-black px-6 py-4 rounded-xl shadow-2xl font-medium tracking-wide flex items-center gap-3 border border-white/10 dark:border-black/10"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-yellow)]" />
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </AuthContext.Provider>
  );
};

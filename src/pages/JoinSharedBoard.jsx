import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';

export const JoinSharedBoard = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [promptError, setPromptError] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('whiteflow_user');
    
    // If not logged in, prompt for name first
    if (!savedUser && !sessionStorage.getItem('guestName')) {
      setShowPrompt(true);
      return;
    }

    joinBoard();
  }, [token, navigate]);

  const joinBoard = async (guestName = null) => {
    setIsJoining(true);
    setPromptError(null);
    try {
      const savedUserStr = localStorage.getItem('whiteflow_user');
      let authToken = null;
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          authToken = savedUser.token;
        } catch(e) {}
      }
      
      const headers = { 'Bypass-Tunnel-Reminder': 'true' };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const currentGuestName = guestName || sessionStorage.getItem('guestName');
      if (currentGuestName) {
        headers['X-Guest-Name'] = currentGuestName;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/share/${token}/join`, {
        method: 'POST',
        headers
      });
        
        if (res.ok) {
          const data = await res.json();
          // Store accessType in sessionStorage or pass via state so Whiteboard knows if VIEW_ONLY
          sessionStorage.setItem(`board_access_${data.boardId}`, data.accessType);
          
          navigate(`/board/${data.boardId}`, {
            state: {
              showLoader: true,
              projectName: 'Shared Board'
            }
          });
        } else if (res.status === 409) {
          // Username taken
          sessionStorage.removeItem('guestName');
          const errData = await res.json();
          setPromptError(errData.message || 'Username already taken by an active user.');
          setShowPrompt(true);
        } else {
          const errData = await res.json();
          setError(errData.message || 'Invalid or expired share link');
        }
    } catch (err) {
      setError('Failed to connect to server. Please try again later.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    
    sessionStorage.setItem('guestName', tempName.trim());
    setShowPrompt(false);
    joinBoard(tempName.trim());
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (showPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Join Board</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
            Please enter your name to collaborate on this board.
          </p>
          
          {promptError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center font-semibold">
              {promptError}
            </div>
          )}

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                autoFocus
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={!tempName.trim() || isJoining}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isJoining ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Join as Guest'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Verifying access...</h2>
    </div>
  );
};

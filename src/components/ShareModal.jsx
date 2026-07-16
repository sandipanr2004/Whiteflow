import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Link as LinkIcon, Users, Globe, Lock, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './ShareModal.module.css';

export const ShareModal = ({ isOpen, onClose, boardId, initialTab = 'share' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // share | manage | members
  const [accessType, setAccessType] = useState('VIEW_EDIT');
  const [visibility, setVisibility] = useState('ANYONE_WITH_LINK');
  const [expiresIn, setExpiresIn] = useState('never'); // never, 1h, 24h, 7d
  const [generatedLink, setGeneratedLink] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLinks, setActiveLinks] = useState([]);
  
  // Members state
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEW_EDIT');
  const [isInviting, setIsInviting] = useState(false);
  
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'manage') fetchLinks();
      if (activeTab === 'members') fetchMembers();
    }
  }, [isOpen, activeTab]);

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/${boardId}/share`);
      if (res.ok) {
        const data = await res.json();
        setActiveLinks(data.filter(link => link.status !== 'REVOKED'));
      }
    } catch (err) {
      console.error('Failed to fetch links', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/collaborate/board/${boardId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const generateLink = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let expirationDate = null;
      if (expiresIn !== 'never') {
        const date = new Date();
        if (expiresIn === '1h') date.setHours(date.getHours() + 1);
        if (expiresIn === '24h') date.setHours(date.getHours() + 24);
        if (expiresIn === '7d') date.setDate(date.getDate() + 7);
        expirationDate = date.toISOString();
      }

      const payload = { accessType, visibility, expiresAt: expirationDate };
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/boards/${boardId}/share`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to generate link');
      const data = await res.json();
      const linkUrl = `${window.location.origin}/join/${data.shareToken}`;
      setGeneratedLink({ ...data, url: linkUrl });
    } catch (err) {
      setError('Could not generate share link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    setError('');
    
    try {
      const userId = user?.username || user?.name || 'anonymous';
      const payload = { inviteeEmail: inviteEmail, role: inviteRole };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/collaborate/invite?boardId=${boardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to invite user');
      
      setInviteEmail('');
      fetchMembers(); // Refresh list after invite
    } catch (err) {
      setError('Could not invite user. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (targetUserId) => {
    try {
      const userId = user?.username || user?.name || 'anonymous';
      await fetch(`${import.meta.env.VITE_API_URL}/api/collaborate/board/${boardId}/member/${targetUserId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId, 'Bypass-Tunnel-Reminder': 'true' }
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  const updateMemberRole = async (targetUserId, newRole) => {
    try {
      const userId = user?.username || user?.name || 'anonymous';
      await fetch(`${import.meta.env.VITE_API_URL}/api/collaborate/board/${boardId}/member/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ role: newRole })
      });
      fetchMembers();
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const revokeLink = async (linkId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/boards/${boardId}/share/${linkId}`, {
        method: 'DELETE',
        headers: { 'Bypass-Tunnel-Reminder': 'true',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      fetchLinks();
    } catch (err) {
      console.error('Failed to revoke link', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Share Board</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'share' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Create Link
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'manage' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Links
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'members' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.errorBanner} style={{marginBottom: '16px'}}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {activeTab === 'share' && (
            <div className={styles.shareSection}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>General Access</label>
                <div className={styles.selectWrapper}>
                  <Globe size={16} className={styles.selectIcon} />
                  <select 
                    value={visibility} 
                    onChange={(e) => setVisibility(e.target.value)}
                    className={styles.select}
                  >
                    <option value="ANYONE_WITH_LINK">Anyone with the link</option>
                    <option value="PRIVATE">Restricted (Invited only)</option>
                  </select>
                </div>
              </div>

              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select 
                    value={accessType} 
                    onChange={(e) => setAccessType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="VIEW_ONLY">Viewer</option>
                    <option value="VIEW_EDIT">Editor</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Expires</label>
                  <select 
                    value={expiresIn} 
                    onChange={(e) => setExpiresIn(e.target.value)}
                    className={styles.select}
                  >
                    <option value="never">Never</option>
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                  </select>
                </div>
              </div>

              {!generatedLink ? (
                <button 
                  className={styles.primaryBtn} 
                  onClick={generateLink}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Link'}
                </button>
              ) : (
                <div className={styles.generatedSection}>
                  <div className={styles.linkDisplay}>
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedLink.url} 
                      className={styles.linkInput} 
                    />
                    <button 
                      className={`${styles.copyBtn} ${isCopied ? styles.copied : ''}`}
                      onClick={() => copyToClipboard(generatedLink.url)}
                    >
                      {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <button 
                    className={styles.secondaryBtn} 
                    onClick={() => setGeneratedLink(null)}
                  >
                    Create Another Link
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className={styles.manageSection}>
              {activeLinks.length === 0 ? (
                <div className={styles.emptyState}>
                  <LinkIcon size={32} className={styles.emptyIcon} />
                  <p>No active share links.</p>
                </div>
              ) : (
                <div className={styles.linksList}>
                  {activeLinks.map(link => (
                    <div key={link.id} className={styles.linkItem}>
                      <div className={styles.linkInfo}>
                        <div className={styles.linkHeader}>
                          <span className={styles.linkRole}>
                            {link.accessType === 'VIEW_EDIT' ? 'Editor' : 'Viewer'}
                          </span>
                          <span className={styles.linkStatus}>
                            {link.visibility === 'PRIVATE' ? <Lock size={12}/> : <Globe size={12}/>}
                            {link.visibility === 'PRIVATE' ? 'Restricted' : 'Public'}
                          </span>
                        </div>
                        <span className={styles.linkCode}>{link.shareToken}</span>
                      </div>
                      <div className={styles.linkActions}>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => copyToClipboard(`${window.location.origin}/join/${link.shareToken}`)}
                          title="Copy Link"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          onClick={() => revokeLink(link.id)}
                          title="Revoke Link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className={styles.membersSection}>
              <div className={styles.inviteForm}>
                <input 
                  type="email" 
                  placeholder="Invite by email..." 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={styles.inviteInput}
                />
                <select 
                  value={inviteRole} 
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={styles.inviteRoleSelect}
                >
                  <option value="VIEW_ONLY">Viewer</option>
                  <option value="VIEW_EDIT">Editor</option>
                </select>
                <button 
                  className={styles.inviteBtn} 
                  onClick={inviteMember}
                  disabled={isInviting || !inviteEmail}
                >
                  {isInviting ? '...' : 'Invite'}
                </button>
              </div>

              <div className={styles.membersList}>
                {members.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Users size={32} className={styles.emptyIcon} />
                    <p>No members yet.</p>
                  </div>
                ) : (
                  members.map(member => (
                    <div key={member.id} className={styles.memberItem}>
                      <div className={styles.memberAvatar}>
                        {member.userId?.substring(0, 1).toUpperCase() || 'U'}
                      </div>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{member.userId}</div>
                        <div className={styles.memberEmail}>Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                      </div>
                      <select 
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                        className={styles.memberRoleSelect}
                        disabled={member.role === 'OWNER'}
                      >
                        <option value="VIEW_ONLY">Viewer</option>
                        <option value="VIEW_EDIT">Editor</option>
                        <option value="OWNER">Owner</option>
                      </select>
                      {member.role !== 'OWNER' && (
                        <button 
                          className={styles.removeMemberBtn}
                          onClick={() => removeMember(member.userId)}
                          title="Remove Member"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

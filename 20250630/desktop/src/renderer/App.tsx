import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import './App.css';

interface UserInfo {
  login: string;
  avatar_url: string;
  email: string | null;
}

function App(): JSX.Element {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Restore login state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      // 延迟验证，确保后端服务已启动
      const verifyToken = async () => {
        try {
          const result: { valid: boolean; user?: UserInfo; error?: string } = await window.electronAPI.verifyToken(savedToken);
          if (result.valid && result.user) {
            setToken(savedToken);
            setUserInfo(result.user);
          } else {
            console.log('Token validation failed:', result.error);
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('auth_token');
        }
      };
      
      // 延迟 1 秒后验证，给后端服务启动时间
      setTimeout(verifyToken, 1000);
    }
  }, []);

  useEffect(() => {
    const api = window.electronAPI as unknown;
    if (
      api &&
      typeof api === 'object' &&
      'onOAuthToken' in api &&
      typeof (api as { onOAuthToken?: unknown }).onOAuthToken === 'function'
    ) {
      (
        api as { onOAuthToken: (cb: (token: string) => void) => void }
      ).onOAuthToken((token: string) => {
        setToken(token);
        localStorage.setItem('auth_token', token);
      });
    }
    
    if (
      api &&
      typeof api === 'object' &&
      'onLogoutComplete' in api &&
      typeof (api as { onLogoutComplete?: unknown }).onLogoutComplete === 'function'
    ) {
      (
        api as { onLogoutComplete: (cb: () => void) => void }
      ).onLogoutComplete(() => {
        setToken(null);
        setUserInfo(null);
        setMessage('');
        setError('');
        localStorage.removeItem('auth_token');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      });
    }
  }, []);

  // Load user info when token changes
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          const result: { valid: boolean; user?: UserInfo; error?: string } = await window.electronAPI.verifyToken(token);
          if (result.valid && result.user) {
            setUserInfo(result.user);
          } else {
            console.log('Token validation failed:', result.error);
            setToken(null);
            setUserInfo(null);
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          setToken(null);
          setUserInfo(null);
          localStorage.removeItem('auth_token');
        }
      };
      
      verifyToken();
    } else {
      setUserInfo(null);
    }
  }, [token]);

  const fetchWelcome = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const msg = await window.electronAPI.fetchWelcomeMessage();
      setMessage(msg);
    } catch (e) {
      setError('Cannot connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.electronAPI.login();
  };

  const handleLogout = () => {
    console.log('[Desktop Renderer] Logout button clicked');
    // 只调用主进程的登出功能，不自己处理任何逻辑
    window.electronAPI.logout();
  };

  const handleClearLogin = () => {
    setToken(null);
    setUserInfo(null);
    setMessage('');
    setError('');
    localStorage.removeItem('auth_token');
  };

  return (
    <>
      <div className="app-header"></div>
      <div className="unified-app">
        <button
          className="unified-btn"
          onClick={fetchWelcome}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Welcome Message'}
        </button>
        
        <button className="unified-btn" onClick={handleLogin}>
          Login
        </button>
        
        {token && (
          <button className="unified-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
        
        {token && (
          <button className="unified-btn clear-btn" onClick={handleClearLogin}>
            Clear Login
          </button>
        )}
        
        {token && (
          <div className="token-display">
            Token: {token}
          </div>
        )}
        
        {userInfo && (
          <div className="user-info">
            <img src={userInfo.avatar_url} alt="avatar" />
            <div>Name: {userInfo.login}</div>
            <div>Email: {userInfo.email || 'None'}</div>
          </div>
        )}
        
        {error && <div className="unified-error">{error}</div>}
        {message && !error && <div className="unified-message">{message}</div>}
      </div>
    </>
  );
}

export default App;

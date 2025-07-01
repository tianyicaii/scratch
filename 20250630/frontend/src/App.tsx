import { useState, useEffect } from 'react';
import './App.css';

interface UserInfo {
  login: string;
  avatar_url: string;
  email: string | null;
}

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isFromDesktop, setIsFromDesktop] = useState(false);
  const [isLogoutFromDesktop, setIsLogoutFromDesktop] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check if opened from desktop
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromDesktop = url.searchParams.get('from') === 'desktop';
    const logoutFromDesktop = url.searchParams.get('logout') === 'desktop';
    const syncLogout = url.searchParams.get('sync-logout') === 'true';
    
    console.log('[Frontend] URL params:', { fromDesktop, logoutFromDesktop, syncLogout });
    
    setIsFromDesktop(fromDesktop);
    setIsLogoutFromDesktop(logoutFromDesktop);

    // Handle sync logout from desktop
    if (syncLogout) {
      console.log('[Frontend] Processing sync logout');
      
      // 立即清除所有状态
      localStorage.removeItem('auth_token');
      setUserInfo(null);
      setToken(null);
      setMessage('');
      setError('');
      
      // Clean up URL
      url.searchParams.delete('sync-logout');
      url.searchParams.delete('t'); // 删除时间戳参数
      window.history.replaceState({}, '', url.pathname + url.search);
      
      // 不刷新页面，只清除状态
      console.log('[Frontend] Sync logout completed, state cleared');
      return;
    }

    // Auto-login if already logged in - 但不要立即重定向，让用户看到状态
    if (fromDesktop) {
      const existingToken = localStorage.getItem('auth_token');
      if (existingToken) {
        console.log('[Frontend] Already logged in, token exists');
        setToken(existingToken);
        // 不立即重定向，让用户看到登录状态
      }
    }
  }, []);

  // Handle token from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const redirectTo = url.searchParams.get('redirect_to');
    
    if (token) {
      localStorage.setItem('auth_token', token);
      setToken(token);
      url.searchParams.delete('token');
      url.searchParams.delete('redirect_to');
      window.history.replaceState({}, '', url.pathname + url.search);
      
      if (redirectTo) {
        const finalUrl = `${redirectTo}?token=${encodeURIComponent(token)}`;
        window.location.href = finalUrl;
      } else if (isFromDesktop) {
        const desktopCallbackUrl = `myapp://oauth-callback?token=${encodeURIComponent(token)}`;
        window.location.href = desktopCallbackUrl;
      }
    }
  }, [isFromDesktop]);

  // Auto-logout if requested
  useEffect(() => {
    if (isLogoutFromDesktop) {
      handleLogout();
    }
  }, [isLogoutFromDesktop]);

  // Load user info
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setToken(token);
    
    if (token) {
      fetch('http://localhost:3001/api/auth/github/get_info', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.login) setUserInfo(data);
        })
        .catch(() => {
          console.log('[Frontend] Failed to fetch user info, clearing token');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUserInfo(null);
        });
    } else {
      setUserInfo(null);
    }
  }, []);

  const fetchWelcome = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3001/api/welcome', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setMessage(data.message);
    } catch (e) {
      setError('Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (isFromDesktop) {
      if (token) {
        // 如果已有token，直接返回给桌面应用
        console.log('[Frontend] Returning existing token to desktop app');
        const desktopCallbackUrl = `myapp://oauth-callback?token=${encodeURIComponent(token)}`;
        window.location.href = desktopCallbackUrl;
      } else {
        // 如果没有token，开始OAuth流程
        const redirectUri = 'myapp://oauth-callback';
        const loginUrl = `http://localhost:3001/api/auth/github/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = loginUrl;
      }
    } else {
      window.location.href = 'http://localhost:3001/api/auth/github/login';
    }
  };

  const handleLogout = async () => {
    console.log('[Frontend] 🚪 Logout button clicked');
    const token = localStorage.getItem('auth_token');
    console.log('[Frontend] Token exists:', !!token);
    
    if (token) {
      try {
        console.log('[Frontend] Calling backend logout API');
        const response = await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          console.log('[Frontend] ✅ Backend logout successful');
        } else {
          console.log('[Frontend] ❌ Backend logout failed:', response.status);
        }
      } catch (error) {
        console.error('[Frontend] ❌ Logout failed:', error);
      }
    }
    
    console.log('[Frontend] Clearing local storage and state');
    localStorage.removeItem('auth_token');
    setToken(null);
    setUserInfo(null);
    
    if (isLogoutFromDesktop) {
      console.log('[Frontend] Redirecting to desktop logout callback');
      window.location.href = 'myapp://logout-callback';
    } else {
      console.log('[Frontend] Reloading page');
      window.location.reload();
    }
  };

  return (
    <div className="unified-app">
      {/* 状态信息栏 */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">登录状态:</span>
          <span className={`status-value ${userInfo ? 'logged-in' : 'logged-out'}`}>
            {userInfo ? '✅ 已登录' : '❌ 未登录'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Token:</span>
          <span className="status-value">
            {token ? '✅ 存在' : '❌ 不存在'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">来源:</span>
          <span className="status-value">
            {isFromDesktop ? '🖥️ Desktop App' : '🌐 Web Browser'}
          </span>
        </div>
        {userInfo && (
          <div className="status-item">
            <span className="status-label">用户:</span>
            <span className="status-value">👤 {userInfo.login}</span>
          </div>
        )}
      </div>
      
      {isFromDesktop && (
        <div className="desktop-notice">
          🔗 Opened from Desktop App
        </div>
      )}
      
      {isLogoutFromDesktop && (
        <div className="logout-notice">
          🔄 Auto-logout in progress...
        </div>
      )}
      
      <button className="unified-btn" onClick={fetchWelcome} disabled={loading}>
        {loading ? 'Loading...' : 'Get Welcome Message'}
      </button>
      
      <button className="unified-btn" onClick={handleLogin}>
        {isFromDesktop && token ? 'Return to Desktop App' : 'Login'}
      </button>
      
      {token && (
        <button className="unified-btn logout-btn" onClick={handleLogout}>
          Logout
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
  );
}

export default App;

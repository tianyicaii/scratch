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

  // 检查 URL token 并存储
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  // 登录后自动获取用户信息
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('http://localhost:3001/api/auth/github/get_info', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.login) setUserInfo(data);
        });
    } else {
      setUserInfo(null);
    }
  }, [localStorage.getItem('auth_token')]);

  const fetchWelcome = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3001/api/welcome', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('请求失败');
      const data = await res.json();
      setMessage(data.message);
    } catch (e) {
      setError('无法连接到后端服务');
    } finally {
      setLoading(false);
    }
  };

  // 登录按钮点击事件
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/github/login';
  };

  const token = localStorage.getItem('auth_token');

  return (
    <div className="unified-app">
      <button className="unified-btn" onClick={fetchWelcome} disabled={loading}>
        {loading ? '加载中...' : '获取欢迎信息'}
      </button>
      <button
        className="unified-btn"
        onClick={handleLogin}
        style={{ marginTop: 8 }}
      >
        登录
      </button>
      {token && (
        <div style={{ marginTop: 16, color: 'green', wordBreak: 'break-all' }}>
          已登录，token: {token}
        </div>
      )}
      {userInfo && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <img
            src={userInfo.avatar_url}
            alt="avatar"
            style={{ width: 64, height: 64, borderRadius: '50%' }}
          />
          <div style={{ marginTop: 8 }}>昵称: {userInfo.login}</div>
          <div>邮箱: {userInfo.email || '无'}</div>
        </div>
      )}
      {error && <div className="unified-error">{error}</div>}
      {message && !error && <div className="unified-message">{message}</div>}
    </div>
  );
}

export default App;

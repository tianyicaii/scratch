import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import './App.css';

function App(): JSX.Element {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

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
      });
    }
  }, []);

  const fetchWelcome = async () => {
    console.log('[Renderer] 点击了获取欢迎信息按钮');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const msg = await window.electronAPI.fetchWelcomeMessage();
      setMessage(msg);
    } catch (e) {
      setError('无法连接到后端服务');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.electronAPI.login();
  };

  return (
    <>
      <div className="app-header"></div>
      <div className="unified-app">
        <button
          className="unified-btn"
          onClick={() => {
            void fetchWelcome();
          }}
          disabled={loading}
        >
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
          <div
            style={{ marginTop: 16, color: 'green', wordBreak: 'break-all' }}
          >
            已登录，token: {token}
          </div>
        )}
        {error && <div className="unified-error">{error}</div>}
        {message && !error && <div className="unified-message">{message}</div>}
      </div>
    </>
  );
}

export default App;

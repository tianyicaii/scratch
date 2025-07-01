import { contextBridge, ipcRenderer } from 'electron';

// 暴露受保护的方法给渲染进程，在没有开启 Node.js 集成的情况下
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在这里添加需要从渲染进程调用的主进程方法
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,

  // IPC通信方法
  fetchWelcomeMessage: () => ipcRenderer.invoke('fetch-welcome-message'),
  fetchUserInfo: (token: string) => ipcRenderer.invoke('fetch-user-info', token),
  verifyToken: (token: string) => ipcRenderer.invoke('verify-token', token),
  login: () => ipcRenderer.send('login'),
  logout: () => ipcRenderer.send('logout'),
  onOAuthToken: (callback: (token: string) => void) => {
    ipcRenderer.on('oauth-token', (_, token) => callback(token));
  },
  onLogoutComplete: (callback: () => void) => {
    ipcRenderer.on('logout-complete', () => callback());
  },
  showContextMenu: () => ipcRenderer.invoke('show-context-menu'),
});

// 为类型安全，在全局声明这些 API
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => string;
      getPlatform: () => string;
      fetchWelcomeMessage: () => Promise<string>;
      fetchUserInfo: (token: string) => Promise<any>;
      verifyToken: (token: string) => Promise<boolean>;
      showContextMenu: () => void;
      login: () => void;
      logout: () => void;
      onOAuthToken: (cb: (token: string) => void) => void;
      onLogoutComplete: (cb: () => void) => void;
    };
  }
}

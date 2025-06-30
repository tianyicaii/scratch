import { contextBridge, ipcRenderer, shell } from 'electron';

// 暴露受保护的方法给渲染进程，在没有开启 Node.js 集成的情况下
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在这里添加需要从渲染进程调用的主进程方法
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,

  // IPC通信方法
  fetchWelcomeMessage: () => {
    console.log('🔗 [Preload] Forwarding fetchWelcomeMessage IPC call to main');
    return ipcRenderer.invoke('fetch-welcome-message');
  },

  // 示例：如果需要与主进程通信
  // sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),

  showContextMenu: () => ipcRenderer.invoke('show-context-menu'),
  openExternal: (url: string) => shell.openExternal(url),
  login: () => ipcRenderer.send('login'),
  onOAuthToken: (cb: (token: string) => void) =>
    ipcRenderer.on('oauth-token', (_event, token: unknown) => {
      if (typeof token === 'string') {
        cb(token);
      }
    }),
});

// 为类型安全，在全局声明这些 API
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => string;
      getPlatform: () => string;
      fetchWelcomeMessage: () => Promise<string>;
      showContextMenu: () => void;
      openExternal: (url: string) => void;
      login: () => void;
      onOAuthToken: (cb: (token: string) => void) => void;
    };
  }
}

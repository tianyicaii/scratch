declare global {
  interface Window {
    electronAPI: {
      getVersion: () => string;
      getPlatform: () => string;
      fetchWelcomeMessage: () => Promise<string>;
      showContextMenu: () => void;
      login: () => void; // 新增这一行
    };
  }
}

export {};

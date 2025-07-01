interface UserInfo {
  login: string;
  avatar_url: string;
  email: string | null;
}

interface VerifyResult {
  valid: boolean;
  user?: UserInfo;
  error?: string;
}

declare global {
  interface Window {
    electronAPI: {
      getVersion: () => string;
      getPlatform: () => string;
      fetchWelcomeMessage: () => Promise<string>;
      fetchUserInfo: (token: string) => Promise<UserInfo>;
      verifyToken: (token: string) => Promise<VerifyResult>;
      showContextMenu: () => void;
      login: () => void;
      logout: () => void;
    };
  }
}

export {};

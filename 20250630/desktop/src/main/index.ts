import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import * as path from 'path';

// Disable proxy for local requests
process.env.NO_PROXY = 'localhost,127.0.0.1';
process.env.no_proxy = 'localhost,127.0.0.1';

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 400,
    minHeight: 300,
    title: 'Desktop App',
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#f5f6fa',
      symbolColor: 'black',
    },
    backgroundColor: '#f5f6fa',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      webSecurity: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

function setAppMenu(): void {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(
    template as Electron.MenuItemConstructorOptions[]
  );
  Menu.setApplicationMenu(menu);
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    const url = commandLine.find(arg => arg.startsWith('myapp://'));
    if (url) {
      const tokenMatch = url.match(/token=([^&]+)/);
      if (tokenMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('oauth-token', token);
        }
      }
      
      if (url.includes('logout-callback')) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('logout-complete');
        }
      }
    }

    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Register custom protocol
app.setAsDefaultProtocolClient('myapp');

// Handle protocol callbacks
app.on('open-url', (event, url) => {
  event.preventDefault();
  const tokenMatch = url.match(/token=([^&]+)/);
  if (tokenMatch) {
    const token = decodeURIComponent(tokenMatch[1]);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('oauth-token', token);
    }
  }
  
  if (url.includes('logout-callback')) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('logout-complete');
    }
  }
});

// App lifecycle
void app.whenReady().then(() => {
  setAppMenu();
  mainWindow = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('fetch-welcome-message', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/welcome');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    const data = (await response.json()) as { message: string };
    return data.message;
  } catch (error) {
    throw new Error('Could not connect to backend server');
  }
});

ipcMain.handle('fetch-user-info', async (event, token: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/github/get_info', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user info: ${response.status} ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not fetch user info: ${errorMessage}`);
  }
});

ipcMain.handle('verify-token', async (event, token: string) => {
  try {
    console.log('[Desktop] Verifying token, length:', token.length);
    const response = await fetch('http://localhost:3001/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('[Desktop] Verify response status:', response.status);
    console.log('[Desktop] Verify response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.log('[Desktop] Error response text:', errorText);
      } catch {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
        console.log('[Desktop] Could not read error response text');
      }
      return { valid: false, error: errorText };
    }
    
    let data;
    try {
      const responseText = await response.text();
      console.log('[Desktop] Response text:', responseText);
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Desktop] JSON parse error:', parseError);
      return { valid: false, error: 'Invalid JSON response from server' };
    }
    
    console.log('[Desktop] Parsed data:', data);
    return data;
  } catch (error) {
    console.error('[Desktop] Verify token error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { valid: false, error: errorMessage };
  }
});

ipcMain.on('login', () => {
  try {
    const frontendUrl = 'http://localhost:4173?from=desktop';
    void shell.openExternal(frontendUrl);
  } catch (err) {
    console.error('Login error:', err);
  }
});

ipcMain.on('logout', async (event) => {
  try {
    console.log('[Desktop] Logout requested');
    
    // 从渲染进程获取当前 token
    const token = await event.sender.executeJavaScript(`
      localStorage.getItem('auth_token')
    `);
    
    console.log('[Desktop] Retrieved token:', token ? 'exists' : 'none');
    
    if (token) {
      // 主进程直接调用后端 logout API
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('[Desktop] Backend logout response:', response.status);
      
      if (response.ok) {
        console.log('[Desktop] Logout successful');
        // 清除渲染进程的本地存储
        await event.sender.executeJavaScript(`
          localStorage.removeItem('auth_token');
        `);
        // 通知渲染进程登出完成
        event.sender.send('logout-complete');
        // 通知前端同步登出状态
        const timestamp = Date.now();
        const frontendUrl = `http://localhost:4173?sync-logout=true&t=${timestamp}`;
        console.log('[Desktop] Opening frontend for sync logout:', frontendUrl);
        void shell.openExternal(frontendUrl);
      } else {
        console.error('[Desktop] Logout failed:', response.status);
        // 即使后端登出失败，也要清除本地状态
        await event.sender.executeJavaScript(`
          localStorage.removeItem('auth_token');
        `);
        event.sender.send('logout-complete');
      }
    } else {
      console.log('[Desktop] No token to logout');
      // 没有token也要通知渲染进程登出完成
      event.sender.send('logout-complete');
    }
  } catch (err) {
    console.error('[Desktop] Logout error:', err);
    // 出错时也要清除本地状态
    try {
      await event.sender.executeJavaScript(`
        localStorage.removeItem('auth_token');
      `);
      event.sender.send('logout-complete');
    } catch (clearError) {
      console.error('[Desktop] Failed to clear local storage:', clearError);
    }
  }
});

ipcMain.handle('show-context-menu', (event): void => {
  const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectAll' },
    { type: 'separator' },
    {
      label: 'Refresh',
      click: (): void => {
        event.sender.reload();
      },
    },
    {
      label: 'Dev Tools',
      click: (): void => {
        event.sender.openDevTools();
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    menu.popup({ window: window });
  }
});

import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import * as path from 'path';

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
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

// 设置全局菜单
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

// 启用单实例模式
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
    }

    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 注册自定义协议
app.setAsDefaultProtocolClient('myapp');

// 处理协议回调
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
});

// 应用启动
void app.whenReady().then(() => {
  setAppMenu();
  mainWindow = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理器
ipcMain.handle('fetch-welcome-message', async () => {
  try {
    const response = await fetch('http://localhost:3001/api/welcome');
    const data = (await response.json()) as { message: string };
    return data.message;
  } catch (error) {
    throw new Error('Could not connect to backend server');
  }
});

// 登录 IPC 处理器
ipcMain.on('login', () => {
  try {
    const redirectUri = 'myapp://oauth-callback';
    const loginUrl = `http://localhost:3001/api/auth/github/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
    void shell.openExternal(loginUrl);
  } catch (err) {
    console.error('[Main] 登录流程出错:', err);
  }
});

// 右键菜单处理器
ipcMain.handle('show-context-menu', (event): void => {
  const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectAll' },
    { type: 'separator' },
    {
      label: '刷新页面',
      click: (): void => {
        event.sender.reload();
      },
    },
    {
      label: '开发者工具',
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

/**
 * Backend API Server
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const FRONTEND_URL = 'http://localhost:4173';
const SERVER_URL = 'http://localhost:3001';

// 用户信息存储文件路径
const USER_DATA_FILE = path.join(__dirname, '../data/users.json');

// 确保数据目录存在
const dataDir = path.dirname(USER_DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 存储结构：
// 1. users: Map<githubId, { login: string, avatar_url: string, email: string | null, tokens: string[] }>
// 2. tokenToUser: Map<token, githubId>

interface UserInfo {
  login: string;
  avatar_url: string;
  email: string | null;
  tokens: string[];
}

interface UserData {
  users: Record<string, UserInfo>;
  tokenToUser: Record<string, string>; // token -> githubId
}

// 从文件加载用户信息
function loadUserData(): UserData {
  try {
    if (fs.existsSync(USER_DATA_FILE)) {
      const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      // 兜底
      return {
        users: parsed.users || {},
        tokenToUser: parsed.tokenToUser || {},
      };
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
  return { users: {}, tokenToUser: {} };
}

// 保存用户信息到文件
function saveUserData(userData: UserData): void {
  try {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(userData, null, 2));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

// 通过 token 获取用户信息
function getUserByToken(token: string): { githubId: string; login: string; avatar_url: string; email: string | null } | null {
  if (!userData || !userData.tokenToUser || !userData.tokenToUser[token]) {
    return null;
  }
  
  const githubId = userData.tokenToUser[token];
  if (!userData.users || !userData.users[githubId]) {
    return null;
  }
  
  const userInfo = userData.users[githubId];
  
  return {
    githubId,
    login: userInfo.login,
    avatar_url: userInfo.avatar_url,
    email: userInfo.email,
  };
}

// 通过 GitHub ID 获取用户信息
function getUserByGitHubId(githubId: string): { tokens: string[]; login: string; avatar_url: string; email: string | null } | null {
  if (!userData || !userData.users || !userData.users[githubId]) {
    return null;
  }
  
  const userInfo = userData.users[githubId];
  return {
    tokens: userInfo.tokens || [],
    login: userInfo.login,
    avatar_url: userInfo.avatar_url,
    email: userInfo.email,
  };
}

// 存储用户信息（支持多 token）
function storeUser(token: string, githubId: string, login: string, avatar_url: string, email: string | null): void {
  // 确保数据结构存在
  if (!userData) userData = { users: {}, tokenToUser: {} };
  if (!userData.users) userData.users = {};
  if (!userData.tokenToUser) userData.tokenToUser = {};
  
  // 如果用户已存在，添加新 token
  if (userData.users[githubId]) {
    const existingUser = userData.users[githubId];
    // 更新用户信息（可能邮箱等信息有变化）
    existingUser.login = login;
    existingUser.avatar_url = avatar_url;
    existingUser.email = email;
    
    // 确保 tokens 数组存在
    if (!existingUser.tokens) existingUser.tokens = [];
    
    // 添加新 token（如果不存在）
    if (!existingUser.tokens.includes(token)) {
      existingUser.tokens.push(token);
    }
  } else {
    // 创建新用户
    userData.users[githubId] = {
      login,
      avatar_url,
      email,
      tokens: [token],
    };
  }
  
  // 更新 token 映射
  userData.tokenToUser[token] = githubId;
  
  saveUserData(userData);
}

// 删除用户 token
function removeUserToken(token: string): void {
  if (!userData || !userData.tokenToUser || !userData.tokenToUser[token]) {
    return;
  }
  
  const githubId = userData.tokenToUser[token];
  if (!userData.users || !userData.users[githubId]) {
    return;
  }
  
  const userInfo = userData.users[githubId];
  
  // 确保 tokens 数组存在
  if (!userInfo.tokens) userInfo.tokens = [];
  
  // 从用户的 token 列表中移除
  userInfo.tokens = userInfo.tokens.filter(t => t !== token);
  
  // 如果用户没有 token 了，删除用户
  if (userInfo.tokens.length === 0) {
    delete userData.users[githubId];
  }
  
  // 删除 token 映射
  delete userData.tokenToUser[token];
  
  saveUserData(userData);
}

// 内存缓存用户数据（从文件加载）
let userData = loadUserData();
console.log('[Storage] 从文件加载了', Object.keys(userData?.tokenToUser || {}).length, '个用户 token');
console.log('[Storage] 从文件加载了', Object.keys(userData?.users || {}).length, '个 GitHub 用户');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/welcome', (req, res) => {
  res.json({
    message: '🚀 Welcome 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GitHub OAuth: Step 1 - Redirect to GitHub
app.get('/api/auth/github/login', (req, res) => {
  console.log('[API] 🔐 Login request received');
  const redirect_uri = req.query.redirect_uri as string;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${SERVER_URL}/api/auth/github/callback`)}&scope=user:email&state=${encodeURIComponent(redirect_uri || '')}`;
  res.redirect(githubAuthUrl);
});

// GitHub OAuth: Step 2 - Callback from GitHub
app.get('/api/auth/github/callback', async (req, res) => {
  console.log('[API] 🔄 OAuth callback received');
  const code = req.query.code as string;
  const state = req.query.state as string;
  
  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    // Exchange code for token
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${SERVER_URL}/api/auth/github/callback`,
    }, { headers: { Accept: 'application/json' } });

    const access_token = tokenRes.data.access_token;
    if (!access_token) {
      return res.status(400).send('No access token received');
    }

    // Get user info
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });

    const { id, login, avatar_url, email } = userRes.data;
    let finalEmail = email;

    if (!finalEmail) {
      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${access_token}` },
      });
      const primaryEmail = emailsRes.data.find((e: any) => e.primary && e.verified);
      finalEmail = primaryEmail ? primaryEmail.email : null;
    }

    // 使用 GitHub ID 作为唯一标识
    const githubId = id.toString();
    
    // 检查用户是否已存在
    const existingUser = getUserByGitHubId(githubId);
    if (existingUser) {
      console.log(`[API] 🔄 User ${login} (ID: ${githubId}) already exists, adding new token`);
    }
    
    // 存储新用户信息（支持多 token）
    storeUser(access_token, githubId, login, avatar_url, finalEmail);
    
    console.log(`[API] ✅ Login successful for user: ${login} (ID: ${githubId})`);

    // Redirect back
    if (state) {
      res.redirect(`${FRONTEND_URL}/?token=${access_token}&redirect_to=${encodeURIComponent(state)}`);
    } else {
      res.redirect(`${FRONTEND_URL}/?token=${access_token}`);
    }
  } catch (err) {
    console.error('[API] ❌ OAuth callback error:', err);
    res.status(500).send('OAuth callback error');
  }
});

// 新增：获取用户信息
app.get('/api/auth/github/get_info', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  
  const token = auth.slice('Bearer '.length);
  const info = getUserByToken(token);
  if (!info) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  res.json(info);
});

// 新增：通过 GitHub ID 获取用户信息
app.get('/api/auth/github/get_info_by_id/:githubId', (req, res) => {
  const githubId = req.params.githubId;
  const info = getUserByGitHubId(githubId);
  if (!info) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    githubId,
    login: info.login,
    email: info.email,
    avatar_url: info.avatar_url,
    tokenCount: info.tokens.length,
    tokens: info.tokens // 注意：生产环境可能不应该返回所有 token
  });
});

// 新增：获取所有用户列表（仅用于调试）
app.get('/api/auth/users', (req, res) => {
  const users = Object.keys(userData.users || {}).map(githubId => {
    const user = userData.users[githubId];
    return {
      githubId,
      login: user.login,
      email: user.email,
      tokenCount: user.tokens.length,
      hasActiveTokens: user.tokens.length > 0
    };
  });
  
  res.json({
    totalUsers: users.length,
    totalTokens: Object.keys(userData.tokenToUser || {}).length,
    users
  });
});

// 新增：获取用户统计信息
app.get('/api/auth/stats', (req, res) => {
  const totalUsers = Object.keys(userData.users || {}).length;
  const totalTokens = Object.keys(userData.tokenToUser || {}).length;
  const usersWithTokens = Object.values(userData.users || {}).filter(user => user.tokens.length > 0).length;
  
  res.json({
    totalUsers,
    totalTokens,
    usersWithTokens,
    usersWithoutTokens: totalUsers - usersWithTokens
  });
});

// 新增：登出 API
app.post('/api/auth/logout', (req, res) => {
  console.log('[API] 🚪 Logout request received');
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('[API] ❌ Logout failed: Missing or invalid token');
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  
  const token = auth.slice('Bearer '.length);
  const userInfo = getUserByToken(token);
  
  if (userInfo) {
    console.log(`[API] ✅ Logout successful for user: ${userInfo.login} (ID: ${userInfo.githubId})`);
  } else {
    console.log('[API] ⚠️ Logout: Token not found in storage');
  }
  
  removeUserToken(token);
  
  res.json({ message: 'Logout successful' });
});

// 新增：验证 token
app.get('/api/auth/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Missing or invalid token' });
  }
  
  const token = auth.slice('Bearer '.length);
  const info = getUserByToken(token);
  if (!info) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
  
  res.json({ valid: true, user: info });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

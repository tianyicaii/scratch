/**
 * Backend API Server
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const FRONTEND_URL = 'http://localhost:4173';
const SERVER_URL = 'http://localhost:3001';

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
  console.log('[OAuth] /api/auth/github/login 被访问');
  const redirect_uri = req.query.redirect_uri as string;
  // 总是重定向到后端的 callback，在 callback 中再处理自定义协议
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${SERVER_URL}/api/auth/github/callback`)}&scope=user:email&state=${encodeURIComponent(redirect_uri || '')}`;
  res.redirect(githubAuthUrl);
});

// 内存缓存 token -> 用户信息
const userInfoMap = new Map<
  string,
  { login: string; avatar_url: string; email: string | null }
>();

// GitHub OAuth: Step 2 - Callback from GitHub
app.get('/api/auth/github/callback', (req, res) => {
  void (async () => {
    const code = req.query.code as string;
    const state = req.query.state as string; // 从 state 参数获取原始 redirect_uri
    if (!code) {
      return res.status(400).send('Missing code');
    }
    try {
      // 用 code 换取 access_token
      const tokenRes = await axios.post<{ access_token: string }>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${SERVER_URL}/api/auth/github/callback`,
        },
        {
          headers: { Accept: 'application/json' },
        }
      );
      const access_token = tokenRes.data.access_token;
      if (!access_token) {
        return res.status(400).send('No access token received');
      }
      // 用 access_token 获取用户信息
      const userRes = await axios.get<{
        login: string;
        avatar_url: string;
        email: string | null;
      }>('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token}` },
      });
      const { login, avatar_url, email } = userRes.data;
      let finalEmail = email;
      // 如果 email 为空，再请求 /user/emails
      if (!finalEmail) {
        const emailsRes = await axios.get<
          { email: string; primary: boolean; verified: boolean }[]
        >('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${access_token}` },
        });
        const primaryEmail = emailsRes.data.find(e => e.primary && e.verified);
        finalEmail = primaryEmail ? primaryEmail.email : null;
      }
      console.log(
        `[OAuth] 获取到用户信息: login=${login}, email=${finalEmail}, avatar_url=${avatar_url}`
      );
      userInfoMap.set(access_token, { login, avatar_url, email: finalEmail });
      // 生成自己的 token（这里简单用 access_token，实际应生成 JWT）
      const myToken = access_token;
      // 重定向回前端或自定义协议，带上 token
      if (state) {
        res.redirect(`${state}?token=${myToken}`);
      } else {
        res.redirect(`${FRONTEND_URL}/?token=${myToken}`);
      }
    } catch (err) {
      console.error('[OAuth] callback error:', err);
      res.status(500).send('OAuth callback error');
    }
  })();
});

// 新增：获取用户信息
app.get('/api/auth/github/get_info', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = auth.slice('Bearer '.length);
  const info = userInfoMap.get(token);
  if (!info) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  res.json(info);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

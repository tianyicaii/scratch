# 用户注册 Edge Function

这个 Edge Function 实现了基于 Supabase Auth 的用户注册功能，支持邮箱验证码注册和密码设置。

## 功能特性

- ✅ **邮箱验证码注册** - 使用 Supabase OTP 功能
- ✅ **密码设置** - 注册后可设置密码
- ✅ **邮箱+密码登录** - 支持传统登录方式
- ✅ **多环境支持** - 开发、测试、生产环境
- ✅ **完整的错误处理** - 详细的错误信息
- ✅ **CORS 支持** - 跨域请求支持

## API 端点

### 1. 发送验证码

**端点:** `POST /functions/v1/register/send-otp`

**请求体:**
```json
{
  "email": "user@example.com"
}
```

**响应:**
```json
{
  "message": "Verification code sent to your email",
  "data": {
    "user": null,
    "session": null
  }
}
```

### 2. 验证验证码

**端点:** `POST /functions/v1/register/verify-otp`

**请求体:**
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

**响应:**
```json
{
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "email_confirmed_at": "2024-01-01T00:00:00Z"
    },
    "session": {
      "access_token": "...",
      "refresh_token": "..."
    }
  }
}
```

### 3. 设置密码

**端点:** `POST /functions/v1/register/set-password`

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "newpassword123"
}
```

**响应:**
```json
{
  "message": "Password set successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
}
```

## 使用流程

### 1. 用户注册流程

```javascript
// 步骤 1: 发送验证码
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

// 步骤 2: 用户输入验证码，验证并注册
const { data, error } = await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email'
})

// 步骤 3: 设置密码（可选）
const { data, error } = await supabase.auth.updateUser({
  password: 'newpassword123'
})
```

### 2. 用户登录流程

```javascript
// 方式 1: 验证码登录
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

// 方式 2: 邮箱+密码登录（需要先设置密码）
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

## 测试

### 使用测试脚本

```bash
# 发送验证码
./scripts/test-register-api.sh development send-otp

# 验证验证码
./scripts/test-register-api.sh development verify-otp

# 设置密码
./scripts/test-register-api.sh development set-password

# 运行完整流程
./scripts/test-register-api.sh development all
```

### 使用 Node.js 测试

```bash
# 运行集成测试
npm run test:register
```

## 部署

### 本地开发

```bash
# 启动本地 Supabase
supabase start

# 启动函数服务
supabase functions serve

# 测试函数
curl -X POST http://localhost:54321/functions/v1/register/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email": "test@example.com"}'
```

### 部署到远程环境

```bash
# 部署到测试环境
./scripts/deploy.sh staging functions

# 部署到生产环境
./scripts/deploy.sh production functions
```

## 配置

### 环境变量

确保在 Supabase 项目设置中配置了以下环境变量：

- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_ANON_KEY` - Supabase 匿名密钥

### 邮件配置

在 Supabase Dashboard 中配置邮件设置：

1. 进入 **Authentication** → **Email Templates**
2. 配置 **Confirm signup** 模板
3. 确保邮件服务正常工作

## 错误处理

### 常见错误

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 邮箱格式无效 | 检查邮箱格式 |
| 400 | 验证码无效 | 检查验证码是否正确 |
| 400 | 密码太短 | 密码至少6位 |
| 500 | 邮件发送失败 | 检查邮件配置 |

### 错误响应格式

```json
{
  "error": "错误描述"
}
```

## 安全考虑

1. **验证码有效期** - Supabase 自动管理验证码过期时间
2. **密码强度** - 建议前端也进行密码强度验证
3. **频率限制** - Supabase 自动限制验证码发送频率
4. **HTTPS** - 生产环境必须使用 HTTPS

## 注意事项

1. 验证码会发送到用户邮箱，用户需要手动输入
2. 设置密码是可选的，用户可以选择只用验证码登录
3. 一旦设置了密码，用户就可以用邮箱+密码登录
4. 验证码有有效期，过期需要重新发送 
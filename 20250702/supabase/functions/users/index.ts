// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 声明 Deno 全局对象 (为了避免 lint 错误)
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

// 用户接口定义
interface User {
  id?: string
  email: string
  name: string
  age?: number
  created_at?: string
  updated_at?: string
}

// 响应接口定义
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

console.log("Users API Function loaded!")

Deno.serve(async (req: Request) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 创建 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const userId = pathSegments[pathSegments.length - 1]

    // 根据 HTTP 方法和路径路由到不同的操作
    switch (method) {
      case 'GET':
        if (userId && userId !== 'users') {
          return await handleGetUser(supabase, userId)
        } else {
          return await handleGetUsers(supabase, url)
        }
      
      case 'POST':
        return await handleCreateUser(supabase, req)
      
      case 'PUT':
        if (!userId || userId === 'users') {
          return createResponse({ success: false, error: 'User ID is required for updates' }, 400)
        }
        return await handleUpdateUser(supabase, userId, req)
      
      case 'DELETE':
        if (!userId || userId === 'users') {
          return createResponse({ success: false, error: 'User ID is required for deletion' }, 400)
        }
        return await handleDeleteUser(supabase, userId)
      
      default:
        return createResponse({ success: false, error: 'Method not allowed' }, 405)
    }

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createResponse({ 
      success: false, 
      error: 'Internal server error',
      message: errorMessage 
    }, 500)
  }
})

// 获取所有用户
async function handleGetUsers(supabase: any, url: URL) {
  try {
    // 支持分页查询
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return createResponse({ success: false, error: error.message }, 400)
    }

    return createResponse({ 
      success: true, 
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createResponse({ success: false, error: errorMessage }, 500)
  }
}

// 获取单个用户
async function handleGetUser(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return createResponse({ success: false, error: 'User not found' }, 404)
      }
      return createResponse({ success: false, error: error.message }, 400)
    }

    return createResponse({ success: true, data })
  } catch (error) {
    console.error('Get user error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createResponse({ success: false, error: errorMessage }, 500)
  }
}

// 创建用户
async function handleCreateUser(supabase: any, req: Request) {
  try {
    const body = await req.json() as User
    
    // 验证必填字段
    if (!body.email || !body.name) {
      return createResponse({ 
        success: false, 
        error: 'Email and name are required' 
      }, 400)
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return createResponse({ 
        success: false, 
        error: 'Invalid email format' 
      }, 400)
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: body.email,
        name: body.name,
        age: body.age || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '23505') {
        return createResponse({ success: false, error: 'Email already exists' }, 409)
      }
      return createResponse({ success: false, error: error.message }, 400)
    }

    return createResponse({ 
      success: true, 
      data, 
      message: 'User created successfully' 
    }, 201)
  } catch (error) {
    console.error('Create user error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createResponse({ success: false, error: errorMessage }, 500)
  }
}

// 更新用户
async function handleUpdateUser(supabase: any, userId: string, req: Request) {
  try {
    const body = await req.json() as Partial<User>
    
    // 验证用户是否存在
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (findError) {
      if (findError.code === 'PGRST116') {
        return createResponse({ success: false, error: 'User not found' }, 404)
      }
      return createResponse({ success: false, error: findError.message }, 400)
    }

    // 准备更新数据
    const updateData: any = {}
    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return createResponse({ 
          success: false, 
          error: 'Invalid email format' 
        }, 400)
      }
      updateData.email = body.email
    }
    if (body.name !== undefined) updateData.name = body.name
    if (body.age !== undefined) updateData.age = body.age

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '23505') {
        return createResponse({ success: false, error: 'Email already exists' }, 409)
      }
      return createResponse({ success: false, error: error.message }, 400)
    }

    return createResponse({ 
      success: true, 
      data, 
      message: 'User updated successfully' 
    })
  } catch (error) {
    console.error('Update user error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createResponse({ success: false, error: errorMessage }, 500)
  }
}

// 删除用户
async function handleDeleteUser(supabase: any, userId: string) {
  try {
    // 验证用户是否存在
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (findError) {
      if (findError.code === 'PGRST116') {
        return createResponse({ success: false, error: 'User not found' }, 404)
      }
      return createResponse({ success: false, error: findError.message }, 400)
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Database error:', error)
      return createResponse({ success: false, error: error.message }, 400)
    }

    return createResponse({ 
      success: true, 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Delete user error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return createResponse({ success: false, error: errorMessage }, 500)
  }
}

// 创建响应
function createResponse(data: ApiResponse, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
}

/* API 使用说明:

本地测试:
1. 运行 `supabase start`
2. 运行 `supabase functions serve`

API 端点:
- GET /users - 获取所有用户 (支持分页: ?page=1&limit=10)
- GET /users/{id} - 获取单个用户
- POST /users - 创建用户
- PUT /users/{id} - 更新用户
- DELETE /users/{id} - 删除用户

示例请求:

# 获取所有用户
curl -X GET 'http://127.0.0.1:54321/functions/v1/users' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]'

# 创建用户
curl -X POST 'http://127.0.0.1:54321/functions/v1/users' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","name":"Test User","age":25}'

# 更新用户
curl -X PUT 'http://127.0.0.1:54321/functions/v1/users/{user_id}' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Updated Name","age":26}'

# 删除用户
curl -X DELETE 'http://127.0.0.1:54321/functions/v1/users/{user_id}' \
  --header 'Authorization: Bearer [YOUR_ANON_KEY]'

*/

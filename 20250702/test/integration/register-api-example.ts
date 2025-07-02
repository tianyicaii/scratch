import { config } from '../../lib/config'

const BASE_URL = 'http://localhost:54321/functions/v1/register'

async function testRegisterFlow() {
  console.log('🧪 开始测试注册流程...')
  
  const testEmail = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`
  const testPassword = 'testpassword123'
  
  try {
    // 步骤 1: 发送验证码
    console.log('\n📧 步骤 1: 发送验证码到邮箱')
    console.log(`测试邮箱: ${testEmail}`)
    
    const sendOtpResponse = await fetch(`${BASE_URL}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.getSupabaseConfig('development').anonKey}`
      },
      body: JSON.stringify({ email: testEmail })
    })
    
    const sendOtpResult = await sendOtpResponse.json()
    
    if (!sendOtpResponse.ok) {
      console.error('❌ 发送验证码失败:', sendOtpResult)
      return
    }
    
    console.log('✅ 验证码发送成功')
    console.log('📝 请检查邮箱并输入收到的验证码')
    
    // 注意：在实际测试中，你需要手动输入验证码
    // 这里我们模拟一个验证码（实际使用时需要从邮箱获取）
    const mockToken = '123456' // 这是模拟的验证码，实际需要从邮箱获取
    
    // 步骤 2: 验证验证码
    console.log('\n🔍 步骤 2: 验证验证码')
    
    const verifyOtpResponse = await fetch(`${BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.getSupabaseConfig('development').anonKey}`
      },
      body: JSON.stringify({ 
        email: testEmail, 
        token: mockToken 
      })
    })
    
    const verifyOtpResult = await verifyOtpResponse.json() as any
    
    if (!verifyOtpResponse.ok) {
      console.error('❌ 验证码验证失败:', verifyOtpResult)
      console.log('💡 提示：在实际测试中，你需要从邮箱获取真实的验证码')
      return
    }
    
    console.log('✅ 验证码验证成功')
    console.log('👤 用户信息:', verifyOtpResult.data?.user)
    
    // 步骤 3: 设置密码
    console.log('\n🔐 步骤 3: 设置密码')
    
    const setPasswordResponse = await fetch(`${BASE_URL}/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.getSupabaseConfig('development').anonKey}`
      },
      body: JSON.stringify({ 
        email: testEmail, 
        password: testPassword 
      })
    })
    
    const setPasswordResult = await setPasswordResponse.json()
    
    if (!setPasswordResponse.ok) {
      console.error('❌ 设置密码失败:', setPasswordResult)
      return
    }
    
    console.log('✅ 密码设置成功')
    
    // 步骤 4: 测试用邮箱+密码登录
    console.log('\n🔑 步骤 4: 测试邮箱+密码登录')
    
    const supabase = config.createSupabaseClient('development')
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) {
      console.error('❌ 邮箱+密码登录失败:', signInError)
      return
    }
    
    console.log('✅ 邮箱+密码登录成功')
    console.log('👤 登录用户:', signInData.user)
    
    console.log('\n🎉 注册流程测试完成！')
    console.log('📋 总结:')
    console.log(`   - 邮箱: ${testEmail}`)
    console.log(`   - 密码: ${testPassword}`)
    console.log('   - 验证码登录: ✅')
    console.log('   - 密码设置: ✅')
    console.log('   - 邮箱+密码登录: ✅')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

// 运行测试
if (require.main === module) {
  testRegisterFlow()
}

export { testRegisterFlow } 
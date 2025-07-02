import { SupabaseTestClient, createTestUser, deleteTestUser } from '../utils/supabase-test-client'
import { generateRandomUser } from '../fixtures/users'

/**
 * 用户 API 测试示例
 * 
 * 这是一个简单的测试示例，展示如何测试 Supabase 用户操作
 * 可以直接运行：npx ts-node test/integration/users-api-example.ts
 */

async function runTests() {
  console.log('🧪 开始运行用户 API 测试...\n')

  try {
    // 清理测试数据
    console.log('🧹 清理测试数据...')
    await SupabaseTestClient.cleanupTestData()

    // 测试1: 创建用户
    console.log('📝 测试1: 创建用户')
    const userData = generateRandomUser()
    console.log('创建用户数据:', userData)
    
    const newUser = await createTestUser(userData)
    console.log('✅ 用户创建成功:', newUser.id)
    
    // 验证用户数据
    if (newUser.email !== userData.email) {
      throw new Error('邮箱不匹配')
    }
    if (newUser.name !== userData.name) {
      throw new Error('姓名不匹配')
    }
    console.log('✅ 用户数据验证通过\n')

    // 测试2: 查询用户
    console.log('🔍 测试2: 查询用户')
    const client = SupabaseTestClient.getClient()
    
    const { data: users, error } = await client
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single()

    if (error) {
      throw new Error(`查询用户失败: ${error.message}`)
    }
    
    if (!users || users.id !== newUser.id) {
      throw new Error('查询到的用户数据不正确')
    }
    console.log('✅ 用户查询成功\n')

    // 测试3: 更新用户
    console.log('📝 测试3: 更新用户')
    const serviceClient = SupabaseTestClient.getServiceClient()
    const updateData = {
      name: '更新后的名称',
      age: 99
    }

    const { data: updatedUser, error: updateError } = await serviceClient
      .from('users')
      .update(updateData)
      .eq('id', newUser.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`更新用户失败: ${updateError.message}`)
    }

    if (!updatedUser || updatedUser.name !== updateData.name) {
      throw new Error('用户更新数据不正确')
    }
    console.log('✅ 用户更新成功\n')

    // 测试4: 删除用户
    console.log('🗑️ 测试4: 删除用户')
    await deleteTestUser(newUser.id)
    
    // 验证用户已被删除
    const { data: deletedUser, error: selectError } = await client
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single()

    if (!selectError || deletedUser) {
      throw new Error('用户删除失败')
    }
    console.log('✅ 用户删除成功\n')

    // 测试5: 批量操作
    console.log('📊 测试5: 批量操作')
    const batchUsers = [
      generateRandomUser(),
      generateRandomUser(),
      generateRandomUser()
    ]

         const createdUsers: any[] = []
     for (const user of batchUsers) {
       const created = await createTestUser(user)
       createdUsers.push(created)
     }
    console.log(`✅ 批量创建 ${createdUsers.length} 个用户`)

    // 查询所有测试用户
    const { data: allTestUsers, error: queryError } = await client
      .from('users')
      .select('*')
      .ilike('email', '%test%')

    if (queryError) {
      throw new Error(`查询测试用户失败: ${queryError.message}`)
    }

    console.log(`✅ 查询到 ${allTestUsers?.length || 0} 个测试用户`)

    // 清理批量创建的用户
    for (const user of createdUsers) {
      await deleteTestUser(user.id)
    }
    console.log('✅ 批量删除测试用户完成\n')

    console.log('🎉 所有测试通过！')

  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  } finally {
    // 最终清理
    await SupabaseTestClient.cleanupTestData()
    SupabaseTestClient.reset()
    console.log('🧹 最终清理完成')
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

export { runTests } 
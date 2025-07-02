#!/bin/bash

# 注册 API 测试脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "Usage: $0 [ENVIRONMENT] [COMMAND]"
    echo ""
    echo "Environments:"
    echo "  development  - 本地开发环境"
    echo "  staging      - 测试环境"
    echo "  production   - 生产环境"
    echo ""
    echo "Commands:"
    echo "  send-otp     - 发送验证码"
    echo "  verify-otp   - 验证验证码"
    echo "  set-password - 设置密码"
    echo "  all          - 运行完整注册流程"
    echo ""
    echo "Examples:"
    echo "  $0 development send-otp"
    echo "  $0 staging all"
}

# 获取环境配置
get_environment_config() {
    local env=$1
    
    case $env in
        "development")
            SUPABASE_URL="http://127.0.0.1:54321"
            SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
            FUNCTIONS_URL="http://127.0.0.1:54321/functions/v1"
            ;;
        "staging")
            source .env
            SUPABASE_URL="$SUPABASE_STAGING_URL"
            SUPABASE_ANON_KEY="$SUPABASE_STAGING_ANON_KEY"
            FUNCTIONS_URL="$SUPABASE_STAGING_URL/functions/v1"
            ;;
        "production")
            source .env
            SUPABASE_URL="$SUPABASE_PROD_URL"
            SUPABASE_ANON_KEY="$SUPABASE_PROD_ANON_KEY"
            FUNCTIONS_URL="$SUPABASE_PROD_URL/functions/v1"
            ;;
        *)
            print_error "Unknown environment: $env"
            exit 1
            ;;
    esac
}

# 发送验证码
test_send_otp() {
    local env=$1
    local email=$2
    
    print_header "测试发送验证码 (环境: $env)"
    
    if [ -z "$email" ]; then
        email="apf1743@gmail.com"
        print_message "使用测试邮箱: $email"
    fi
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -d "{\"email\": \"$email\"}" \
        "$FUNCTIONS_URL/register/send-otp")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        print_message "✅ 验证码发送成功"
        echo "$email" > .test_email.txt
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "❌ 验证码发送失败 (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

# 验证验证码
test_verify_otp() {
    local env=$1
    local email=$2
    local token=$3
    
    print_header "测试验证验证码 (环境: $env)"
    
    if [ -z "$email" ]; then
        if [ -f .test_email.txt ]; then
            email=$(cat .test_email.txt)
        else
            print_error "请先运行 send-otp 或提供邮箱地址"
            return 1
        fi
    fi
    
    if [ -z "$token" ]; then
        print_warning "请提供验证码 (从邮箱获取)"
        read -p "验证码: " token
    fi
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -d "{\"email\": \"$email\", \"token\": \"$token\"}" \
        "$FUNCTIONS_URL/register/verify-otp")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        print_message "✅ 验证码验证成功"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "❌ 验证码验证失败 (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

# 设置密码
test_set_password() {
    local env=$1
    local email=$2
    local password=$3
    
    print_header "测试设置密码 (环境: $env)"
    
    if [ -z "$email" ]; then
        if [ -f .test_email.txt ]; then
            email=$(cat .test_email.txt)
        else
            print_error "请先运行 send-otp 或提供邮箱地址"
            return 1
        fi
    fi
    
    if [ -z "$password" ]; then
        password="testpassword123"
        print_message "使用默认密码: $password"
    fi
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}" \
        "$FUNCTIONS_URL/register/set-password")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        print_message "✅ 密码设置成功"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "❌ 密码设置失败 (HTTP $http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

# 运行完整注册流程
test_full_flow() {
    local env=$1
    local email=$2
    
    print_header "运行完整注册流程 (环境: $env)"
    
    # 步骤 1: 发送验证码
    if ! test_send_otp "$env" "$email"; then
        return 1
    fi
    
    # 获取邮箱地址
    if [ -z "$email" ]; then
        email=$(cat .test_email.txt)
    fi
    
    print_message "请检查邮箱 $email 并获取验证码"
    read -p "请输入验证码: " token
    
    # 步骤 2: 验证验证码
    if ! test_verify_otp "$env" "$email" "$token"; then
        return 1
    fi
    
    # 步骤 3: 设置密码
    if ! test_set_password "$env" "$email"; then
        return 1
    fi
    
    print_message "🎉 完整注册流程测试完成！"
    print_message "📋 测试账户信息:"
    print_message "   - 邮箱: $email"
    print_message "   - 密码: testpassword123"
}

# 清理测试文件
cleanup() {
    if [ -f .test_email.txt ]; then
        rm .test_email.txt
    fi
}

# 主函数
main() {
    if [ $# -lt 2 ]; then
        show_help
        exit 1
    fi
    
    local env=$1
    local command=$2
    local email=$3
    local token=$4
    local password=$5
    
    # 获取环境配置
    get_environment_config "$env"
    
    # 设置清理钩子
    trap cleanup EXIT
    
    case $command in
        "send-otp")
            test_send_otp "$env" "$email"
            ;;
        "verify-otp")
            test_verify_otp "$env" "$email" "$token"
            ;;
        "set-password")
            test_set_password "$env" "$email" "$password"
            ;;
        "all")
            test_full_flow "$env" "$email"
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 
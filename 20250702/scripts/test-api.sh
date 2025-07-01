#!/bin/bash

# API 测试脚本

set -e

# 加载 .env 文件
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

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
    echo "Usage: $0 [ENVIRONMENT] [FUNCTION_NAME]"
    echo ""
    echo "Environments:"
    echo "  dev, development    - 开发环境"
    echo "  staging             - 测试环境"
    echo "  prod, production    - 生产环境"
    echo ""
    echo "Function Names:"
    echo "  users               - 用户管理函数"
    echo ""
    echo "Examples:"
    echo "  $0 dev users        - 测试开发环境的用户函数"
    echo "  $0 staging users    - 测试测试环境的用户函数"
}

# 获取 API URL
get_api_url() {
    local env=$1
    local func_name=$2
    
    case $env in
        "development"|"dev")
            echo "http://localhost:54321/functions/v1/$func_name"
            ;;
        "staging")
            echo "https://$SUPABASE_STAGING_PROJECT_REF.supabase.co/functions/v1/$func_name"
            ;;
        "production"|"prod")
            echo "https://$SUPABASE_PROD_PROJECT_REF.supabase.co/functions/v1/$func_name"
            ;;
        *)
            print_error "Unknown environment: $env"
            exit 1
            ;;
    esac
}

# 获取认证头
get_auth_header() {
    local env=$1
    
    case $env in
        "development"|"dev")
            echo "Bearer $SUPABASE_DEV_ANON_KEY"
            ;;
        "staging")
            echo "Bearer $SUPABASE_STAGING_ANON_KEY"
            ;;
        "production"|"prod")
            echo "Bearer $SUPABASE_PROD_ANON_KEY"
            ;;
    esac
}

# 测试 GET 请求
test_get() {
    local url=$1
    local auth_header=$2
    local description=$3
    
    print_header "Testing GET $description"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: $auth_header" \
        -H "Content-Type: application/json" \
        "$url")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $http_code"
    echo "Response: $body"
    echo ""
}

# 测试 POST 请求
test_post() {
    local url=$1
    local auth_header=$2
    local data=$3
    local description=$4
    
    print_header "Testing POST $description"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: $auth_header" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$url")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $http_code"
    echo "Response: $body"
    echo ""
}

# 测试 PUT 请求
test_put() {
    local url=$1
    local auth_header=$2
    local data=$3
    local description=$4
    
    print_header "Testing PUT $description"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: $auth_header" \
        -H "Content-Type: application/json" \
        -d "$data" \
        -X PUT \
        "$url")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $http_code"
    echo "Response: $body"
    echo ""
}

# 测试 DELETE 请求
test_delete() {
    local url=$1
    local auth_header=$2
    local description=$3
    
    print_header "Testing DELETE $description"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: $auth_header" \
        -H "Content-Type: application/json" \
        -X DELETE \
        "$url")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $http_code"
    echo "Response: $body"
    echo ""
}

# 测试用户函数
test_users_function() {
    local env=$1
    local base_url=$(get_api_url "$env" "users")
    local auth_header=$(get_auth_header "$env")
    
    print_message "Testing users function in $env environment"
    print_message "Base URL: $base_url"
    echo ""
    
    # 测试获取所有用户
    test_get "$base_url" "$auth_header" "Get all users"
    
    # 测试创建用户
    test_post "$base_url" "$auth_header" \
        '{"email":"test@example.com","name":"Test User","age":25}' \
        "Create new user"
    
    # 测试创建另一个用户
    test_post "$base_url" "$auth_header" \
        '{"email":"test2@example.com","name":"Test User 2","age":30}' \
        "Create another user"
    
    # 再次获取所有用户
    test_get "$base_url" "$auth_header" "Get all users after creation"
    
    # 注意：这里需要从响应中提取用户ID，实际使用时可能需要解析JSON
    # 为了简化，我们假设有一个已知的用户ID
    print_warning "Note: Update and delete tests require valid user IDs"
    print_warning "You may need to manually extract IDs from the responses above"
    
    # 测试更新用户（需要有效的用户ID）
    # test_put "$base_url/some-user-id" "$auth_header" \
    #     '{"name":"Updated User","age":26}' \
    #     "Update user"
    
    # 测试删除用户（需要有效的用户ID）
    # test_delete "$base_url/some-user-id" "$auth_header" "Delete user"
}

# 主函数
main() {
    if [ $# -lt 2 ]; then
        show_help
        exit 1
    fi
    
    local env=$1
    local func_name=$2
    
    # 标准化环境名称
    case $env in
        "dev") env="development" ;;
        "prod") env="production" ;;
    esac
    
    print_message "Environment: $env"
    print_message "Function: $func_name"
    echo ""
    
    # 根据函数名称执行相应的测试
    case $func_name in
        "users")
            test_users_function "$env"
            ;;
        *)
            print_error "Unknown function: $func_name"
            show_help
            exit 1
            ;;
    esac
    
    print_message "API testing completed!"
}

# 运行主函数
main "$@" 
#!/bin/bash

# 环境设置脚本

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
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  init                - 初始化环境变量文件"
    echo "  staging             - 配置测试环境"
    echo "  production          - 配置生产环境"
    echo "  validate            - 验证环境配置"
    echo ""
    echo "Examples:"
    echo "  $0 init             - 创建 .env 文件"
    echo "  $0 staging          - 配置测试环境"
}

# 创建 .env 文件
create_env_file() {
    if [ -f ".env" ]; then
        print_warning ".env 文件已存在，是否要覆盖？(y/N)"
        read -r response
        if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_message "取消创建 .env 文件"
            return
        fi
    fi
    
    print_message "创建 .env 文件..."
    
    cat > .env << 'EOF'
# Supabase 多环境配置
# 当前环境 (development, staging, production)
NODE_ENV=staging

# 开发环境 (本地开发)
SUPABASE_DEV_URL=http://127.0.0.1:54321
SUPABASE_DEV_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_DEV_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_DEV_PROJECT_REF=local

# 测试环境 (您的 Supabase 项目)
SUPABASE_STAGING_URL=https://zddhlygohdhcswezjjpt.supabase.co
SUPABASE_STAGING_ANON_KEY=your-staging-anon-key-here
SUPABASE_STAGING_SERVICE_ROLE_KEY=your-staging-service-role-key-here
SUPABASE_STAGING_PROJECT_REF=zddhlygohdhcswezjjpt

# 生产环境 (待配置)
SUPABASE_PROD_URL=https://your-prod-project.supabase.co
SUPABASE_PROD_ANON_KEY=your-prod-anon-key
SUPABASE_PROD_SERVICE_ROLE_KEY=your-prod-service-role-key
SUPABASE_PROD_PROJECT_REF=your-prod-project-ref

# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# JWT 密钥 (用于本地开发)
JWT_SECRET=your-jwt-secret-key

# 其他配置
API_BASE_URL=http://localhost:54321
FUNCTIONS_URL=http://localhost:54321/functions/v1
EOF

    print_message ".env 文件创建成功！"
    print_warning "请编辑 .env 文件，填入您的 Supabase 项目密钥"
}

# 配置测试环境
setup_staging() {
    print_header "配置测试环境"
    echo ""
    echo "请从您的 Supabase 项目仪表板获取以下信息："
    echo "项目 URL: https://zddhlygohdhcswezjjpt.supabase.co"
    echo ""
    echo "1. 进入项目设置 -> API"
    echo "2. 复制 'anon public' 密钥"
    echo "3. 复制 'service_role secret' 密钥"
    echo ""
    
    read -p "请输入 anon public 密钥: " anon_key
    read -p "请输入 service_role secret 密钥: " service_key
    
    if [ -f ".env" ]; then
        # 更新 .env 文件中的测试环境配置
        sed -i.bak "s|SUPABASE_STAGING_ANON_KEY=.*|SUPABASE_STAGING_ANON_KEY=$anon_key|" .env
        sed -i.bak "s|SUPABASE_STAGING_SERVICE_ROLE_KEY=.*|SUPABASE_STAGING_SERVICE_ROLE_KEY=$service_key|" .env
        
        print_message "测试环境配置已更新！"
        print_message "项目引用 ID: zddhlygohdhcswezjjpt"
        print_message "项目 URL: https://zddhlygohdhcswezjjpt.supabase.co"
    else
        print_error ".env 文件不存在，请先运行 '$0 init'"
        exit 1
    fi
}

# 配置生产环境
setup_production() {
    print_header "配置生产环境"
    echo ""
    echo "请提供生产环境的 Supabase 项目信息："
    echo ""
    
    read -p "请输入生产环境项目引用 ID: " prod_ref
    read -p "请输入生产环境项目 URL: " prod_url
    read -p "请输入生产环境 anon public 密钥: " prod_anon_key
    read -p "请输入生产环境 service_role secret 密钥: " prod_service_key
    
    if [ -f ".env" ]; then
        # 更新 .env 文件中的生产环境配置
        sed -i.bak "s|SUPABASE_PROD_URL=.*|SUPABASE_PROD_URL=$prod_url|" .env
        sed -i.bak "s|SUPABASE_PROD_ANON_KEY=.*|SUPABASE_PROD_ANON_KEY=$prod_anon_key|" .env
        sed -i.bak "s|SUPABASE_PROD_SERVICE_ROLE_KEY=.*|SUPABASE_PROD_SERVICE_ROLE_KEY=$prod_service_key|" .env
        sed -i.bak "s|SUPABASE_PROD_PROJECT_REF=.*|SUPABASE_PROD_PROJECT_REF=$prod_ref|" .env
        
        print_message "生产环境配置已更新！"
    else
        print_error ".env 文件不存在，请先运行 '$0 init'"
        exit 1
    fi
}

# 验证环境配置
validate_config() {
    print_header "验证环境配置"
    echo ""
    
    if [ ! -f ".env" ]; then
        print_error ".env 文件不存在"
        exit 1
    fi
    
    # 加载环境变量
    source .env
    
    # 验证测试环境
    echo "测试环境配置："
    if [ "$SUPABASE_STAGING_URL" != "your-staging-url-here" ] && [ -n "$SUPABASE_STAGING_URL" ]; then
        echo "  ✓ URL: $SUPABASE_STAGING_URL"
    else
        echo "  ✗ URL: 未配置"
    fi
    
    if [ "$SUPABASE_STAGING_ANON_KEY" != "your-staging-anon-key-here" ] && [ -n "$SUPABASE_STAGING_ANON_KEY" ]; then
        echo "  ✓ Anon Key: ${SUPABASE_STAGING_ANON_KEY:0:20}..."
    else
        echo "  ✗ Anon Key: 未配置"
    fi
    
    if [ "$SUPABASE_STAGING_SERVICE_ROLE_KEY" != "your-staging-service-role-key-here" ] && [ -n "$SUPABASE_STAGING_SERVICE_ROLE_KEY" ]; then
        echo "  ✓ Service Role Key: ${SUPABASE_STAGING_SERVICE_ROLE_KEY:0:20}..."
    else
        echo "  ✗ Service Role Key: 未配置"
    fi
    
    if [ "$SUPABASE_STAGING_PROJECT_REF" != "your-staging-project-ref" ] && [ -n "$SUPABASE_STAGING_PROJECT_REF" ]; then
        echo "  ✓ Project Ref: $SUPABASE_STAGING_PROJECT_REF"
    else
        echo "  ✗ Project Ref: 未配置"
    fi
    
    echo ""
    
    # 验证生产环境
    echo "生产环境配置："
    if [ "$SUPABASE_PROD_URL" != "https://your-prod-project.supabase.co" ] && [ -n "$SUPABASE_PROD_URL" ]; then
        echo "  ✓ URL: $SUPABASE_PROD_URL"
    else
        echo "  ✗ URL: 未配置"
    fi
    
    if [ "$SUPABASE_PROD_ANON_KEY" != "your-prod-anon-key" ] && [ -n "$SUPABASE_PROD_ANON_KEY" ]; then
        echo "  ✓ Anon Key: ${SUPABASE_PROD_ANON_KEY:0:20}..."
    else
        echo "  ✗ Anon Key: 未配置"
    fi
    
    if [ "$SUPABASE_PROD_SERVICE_ROLE_KEY" != "your-prod-service-role-key" ] && [ -n "$SUPABASE_PROD_SERVICE_ROLE_KEY" ]; then
        echo "  ✓ Service Role Key: ${SUPABASE_PROD_SERVICE_ROLE_KEY:0:20}..."
    else
        echo "  ✗ Service Role Key: 未配置"
    fi
    
    if [ "$SUPABASE_PROD_PROJECT_REF" != "your-prod-project-ref" ] && [ -n "$SUPABASE_PROD_PROJECT_REF" ]; then
        echo "  ✓ Project Ref: $SUPABASE_PROD_PROJECT_REF"
    else
        echo "  ✗ Project Ref: 未配置"
    fi
    
    echo ""
    print_message "环境配置验证完成！"
}

# 主函数
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi
    
    local command=$1
    
    case $command in
        "init")
            create_env_file
            ;;
        "staging")
            setup_staging
            ;;
        "production")
            setup_production
            ;;
        "validate")
            validate_config
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
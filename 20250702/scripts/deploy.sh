#!/bin/bash

# 部署脚本 - 支持多环境部署

set -e

# 加载 .env 文件
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 显示帮助信息
show_help() {
    echo "Usage: $0 [ENVIRONMENT] [COMMAND]"
    echo ""
    echo "Environments:"
    echo "  dev, development    - 开发环境"
    echo "  staging             - 测试环境"
    echo "  prod, production    - 生产环境"
    echo ""
    echo "Commands:"
    echo "  init                - 初始化项目"
    echo "  link                - 链接到 Supabase 项目"
    echo "  deploy              - 部署数据库和函数"
    echo "  functions           - 仅部署 Edge Functions"
    echo "  db                  - 仅部署数据库"
    echo "  reset               - 重置数据库"
    echo "  seed                - 运行种子数据"
    echo ""
    echo "Examples:"
    echo "  $0 dev init         - 初始化开发环境"
    echo "  $0 staging deploy   - 部署到测试环境"
    echo "  $0 prod functions   - 部署函数到生产环境"
}

# 验证环境变量
validate_env_vars() {
    local env=$1
    
    case $env in
        "development"|"dev")
            required_vars=("SUPABASE_DEV_URL" "SUPABASE_DEV_ANON_KEY" "SUPABASE_DEV_SERVICE_ROLE_KEY" "SUPABASE_DEV_PROJECT_REF")
            ;;
        "staging")
            required_vars=("SUPABASE_STAGING_URL" "SUPABASE_STAGING_ANON_KEY" "SUPABASE_STAGING_SERVICE_ROLE_KEY" "SUPABASE_STAGING_PROJECT_REF")
            ;;
        "production"|"prod")
            required_vars=("SUPABASE_PROD_URL" "SUPABASE_PROD_ANON_KEY" "SUPABASE_PROD_SERVICE_ROLE_KEY" "SUPABASE_PROD_PROJECT_REF")
            ;;
        *)
            print_error "Unknown environment: $env"
            exit 1
            ;;
    esac
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Missing required environment variable: $var"
            exit 1
        fi
    done
    
    print_message "Environment variables validated for $env"
}

# 获取项目引用
get_project_ref() {
    local env=$1
    
    case $env in
        "development"|"dev")
            echo "$SUPABASE_DEV_PROJECT_REF"
            ;;
        "staging")
            echo "$SUPABASE_STAGING_PROJECT_REF"
            ;;
        "production"|"prod")
            echo "$SUPABASE_PROD_PROJECT_REF"
            ;;
    esac
}

# 初始化项目
init_project() {
    print_message "Initializing Supabase project..."
    
    if [ ! -f "supabase/config.toml" ]; then
        supabase init
    else
        print_warning "Supabase project already initialized"
    fi
}

# 链接项目
link_project() {
    local env=$1
    local project_ref=$(get_project_ref $env)
    
    print_message "Linking to Supabase project: $project_ref"
    supabase link --project-ref "$project_ref"
}

# 部署数据库
deploy_database() {
    local env=$1
    
    print_message "Deploying database to $env environment..."
    supabase db push
}

# 部署函数
deploy_functions() {
    local env=$1
    
    print_message "Deploying Edge Functions to $env environment..."
    
    # 获取所有函数目录
    for func_dir in supabase/functions/*/; do
        if [ -d "$func_dir" ]; then
            func_name=$(basename "$func_dir")
            print_message "Deploying function: $func_name"
            supabase functions deploy "$func_name"
        fi
    done
}

# 重置数据库
reset_database() {
    local env=$1
    
    print_warning "This will reset the database in $env environment. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_message "Resetting database..."
        supabase db reset
    else
        print_message "Database reset cancelled"
    fi
}

# 运行种子数据
run_seed() {
    local env=$1
    
    print_message "Running seed data for $env environment..."
    supabase db reset --seed
}

# 主函数
main() {
    if [ $# -lt 2 ]; then
        show_help
        exit 1
    fi
    
    local env=$1
    local command=$2
    
    # 标准化环境名称
    case $env in
        "dev") env="development" ;;
        "prod") env="production" ;;
    esac
    
    print_message "Environment: $env"
    print_message "Command: $command"
    
    # 验证环境变量
    validate_env_vars "$env"
    
    # 执行命令
    case $command in
        "init")
            init_project
            ;;
        "link")
            link_project "$env"
            ;;
        "deploy")
            deploy_database "$env"
            deploy_functions "$env"
            ;;
        "functions")
            deploy_functions "$env"
            ;;
        "db")
            deploy_database "$env"
            ;;
        "reset")
            reset_database "$env"
            ;;
        "seed")
            run_seed "$env"
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
    
    print_message "Command completed successfully!"
}

# 运行主函数
main "$@" 
# 环境变量配置说明

## Supabase 配置

在项目根目录创建 `.env.local` 文件，并添加以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 如何获取 Supabase 配置

1. 访问 [Supabase](https://app.supabase.com/)
2. 创建新项目或选择现有项目
3. 进入项目设置（Settings）→ API
4. 复制以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 配置示例

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 注意事项

- `.env.local` 文件已添加到 `.gitignore`，不会被提交到 Git
- 修改环境变量后需要重启开发服务器
- 确保 Supabase 项目已启用 Email 认证


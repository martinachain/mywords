# Netlify 环境变量配置指南

## 必需的环境变量

在 Netlify 部署时，需要在 Netlify Dashboard 中配置以下环境变量：

### 1. Supabase 配置

```
NEXT_PUBLIC_SUPABASE_URL=https://krnzrnunigcsqllwlxno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 2. DeepSeek API 配置

```
DEEPSEEK_API_KEY=sk-40e5d2076d2b47218005e49fdc382fb5
```

## 如何在 Netlify 中配置环境变量

1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 选择你的项目
3. 进入 **Site settings** → **Environment variables**
4. 点击 **Add a variable** 添加每个环境变量
5. 确保变量名称完全匹配（注意大小写）
6. 保存后重新部署

## 环境变量列表

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGci...` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxx...` |

## 注意事项

- ⚠️ **重要**：环境变量名称必须完全匹配（区分大小写）
- 不要在代码中硬编码 API Key
- 修改环境变量后需要重新部署才能生效
- `NEXT_PUBLIC_` 前缀的变量会在客户端代码中可用
- 没有 `NEXT_PUBLIC_` 前缀的变量只在服务器端可用（如 `DEEPSEEK_API_KEY`）

## 验证配置

部署后，检查构建日志中是否显示：
```
Resolved config
- DEEPSEEK_API_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_URL
```

如果环境变量配置正确，构建应该能够成功完成。


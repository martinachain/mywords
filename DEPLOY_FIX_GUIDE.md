# Netlify 部署修复详细指南

## 问题诊断

根据错误日志，主要问题是：
1. `/login` 页面在构建时预渲染失败
2. 原因是 `useSearchParams()` 在静态生成时无法工作

## 已修复的问题

### ✅ 1. API Key 环境变量化
- `app/api/word/route.ts` - 已改为从 `process.env.DEEPSEEK_API_KEY` 读取
- `app/api/generate-story/route.ts` - 已改为从 `process.env.DEEPSEEK_API_KEY` 读取

### ✅ 2. Login 页面 Suspense 包装
- 使用 `Suspense` 包装 `useSearchParams()` 以避免构建时预渲染错误

### ✅ 3. Netlify 配置文件
- 已创建 `netlify.toml` 配置文件

## 完整部署步骤

### 第一步：确保代码已提交

```bash
# 检查修改的文件
git status

# 添加所有修改
git add .

# 提交修改
git commit -m "Fix Netlify deployment: use env vars and fix login page"

# 推送到远程仓库
git push
```

### 第二步：在 Netlify 中配置环境变量

1. **登录 Netlify Dashboard**
   - 访问：https://app.netlify.com/
   - 登录你的账户

2. **选择你的项目**
   - 在项目列表中找到你的项目

3. **进入环境变量设置**
   - 点击项目名称进入项目详情
   - 点击 **Site settings**（站点设置）
   - 在左侧菜单中找到 **Environment variables**（环境变量）
   - 点击进入

4. **添加环境变量**
   点击 **Add a variable**（添加变量），逐个添加以下变量：

   **变量 1：DeepSeek API Key**
   - Key: `DEEPSEEK_API_KEY`
   - Value: `sk-40e5d2076d2b47218005e49fdc382fb5`
   - 点击 **Save**

   **变量 2：Supabase URL**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://krnzrnunigcsqllwlxno.supabase.co`
   - 点击 **Save**

   **变量 3：Supabase Anon Key**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybnpybnVuaWdjc3FsbHdseG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNjk3MDYsImV4cCI6MjA4MjY0NTcwNn0.YRpizVYB2jOOvKtzGGiGkxHn63GryQ1xEYB94fzWt7I`
   - 点击 **Save**

5. **验证环境变量**
   确保列表中显示：
   - ✅ `DEEPSEEK_API_KEY`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`

### 第三步：触发重新部署

有两种方式：

**方式 1：通过 Git 推送触发（推荐）**
```bash
# 如果还没有推送代码，执行：
git push
```
Netlify 会自动检测到新的提交并开始构建。

**方式 2：手动触发**
1. 在 Netlify Dashboard 中，进入你的项目
2. 点击 **Deploys**（部署）标签
3. 点击 **Trigger deploy**（触发部署）
4. 选择 **Deploy site**（部署站点）

### 第四步：监控构建过程

1. 在 Netlify Dashboard 中，点击 **Deploys** 标签
2. 查看最新的部署状态
3. 点击部署条目查看详细日志

### 第五步：验证部署成功

构建成功后，你应该看到：
- ✅ 绿色状态：**Published**（已发布）
- ✅ 构建日志中没有错误
- ✅ 网站可以正常访问

## 常见问题排查

### 问题 1：构建仍然失败

**检查清单：**
- [ ] 环境变量名称是否正确（区分大小写）
- [ ] 环境变量值是否正确（没有多余空格）
- [ ] 代码是否已推送到 Git 仓库
- [ ] Netlify 是否连接到正确的 Git 仓库分支

**解决方法：**
1. 检查构建日志中的错误信息
2. 确认环境变量在 "Resolved config" 部分显示
3. 如果环境变量未显示，重新添加并保存

### 问题 2：环境变量未生效

**解决方法：**
1. 确保环境变量名称完全匹配（注意大小写）
2. 保存环境变量后，必须重新部署才能生效
3. 检查构建日志中的 "Resolved config" 部分

### 问题 3：API 调用失败

**解决方法：**
1. 确认 `DEEPSEEK_API_KEY` 已正确配置
2. 确认 API Key 有效且未过期
3. 检查浏览器控制台是否有错误信息

## 修改的文件清单

以下文件已被修改，确保它们都已提交：

- ✅ `app/api/word/route.ts` - 使用环境变量
- ✅ `app/api/generate-story/route.ts` - 使用环境变量
- ✅ `app/login/page.tsx` - 添加 Suspense 包装
- ✅ `next.config.mjs` - 更新配置
- ✅ `netlify.toml` - Netlify 配置文件（新建）

## 验证部署

部署成功后，测试以下功能：

1. **访问网站首页** - 应该正常加载
2. **登录功能** - 应该可以正常登录
3. **查询单词** - 应该可以调用 DeepSeek API
4. **生成故事** - 应该可以生成情境短文

如果所有功能正常，说明部署成功！🎉


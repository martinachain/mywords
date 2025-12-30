# PWA 图标生成指南

## 图标要求

PWA 需要以下图标文件：

- `icon-192.png` - 192x192 像素
- `icon-512.png` - 512x512 像素

这些文件需要放在 `public` 文件夹下。

## 生成图标的方法

### 方法 1: 使用在线工具（推荐）

1. **PWA Asset Generator** (最简单)
   - 访问：https://www.pwabuilder.com/imageGenerator
   - 上传一个至少 512x512 的原始图标
   - 工具会自动生成所有需要的尺寸
   - 下载并解压，将 `icon-192.png` 和 `icon-512.png` 复制到 `public` 文件夹

2. **RealFaviconGenerator**
   - 访问：https://realfavicongenerator.net/
   - 上传图标，选择 PWA 选项
   - 下载生成的文件

### 方法 2: 使用设计工具

如果你有设计工具（如 Figma、Photoshop、Sketch）：

1. 创建一个 512x512 像素的画布
2. 设计你的图标（建议使用 "My Words" 的 Logo，比如对话气泡 + W 字母）
3. 导出为 PNG 格式
4. 使用图片编辑工具或在线工具将 512x512 的图标缩放到 192x192

### 方法 3: 使用命令行工具（ImageMagick）

如果你安装了 ImageMagick：

```bash
# 假设你有一个 icon.png 源文件（至少 512x512）
convert icon.png -resize 192x192 public/icon-192.png
convert icon.png -resize 512x512 public/icon-512.png
```

### 方法 4: 使用 Node.js 脚本

创建一个临时脚本 `generate-icons.js`：

```javascript
const sharp = require('sharp');
const fs = require('fs');

// 假设你有一个 icon-source.png 源文件
sharp('icon-source.png')
  .resize(192, 192)
  .toFile('public/icon-192.png')
  .then(() => console.log('Generated icon-192.png'));

sharp('icon-source.png')
  .resize(512, 512)
  .toFile('public/icon-512.png')
  .then(() => console.log('Generated icon-512.png'));
```

运行：`node generate-icons.js`（需要先安装 sharp: `npm install sharp`）

## 图标设计建议

1. **使用你的 Logo**：建议使用 "My Words" 的 Logo（对话气泡 + W 字母）
2. **背景颜色**：使用白色或你的主题色（#ffffff）
3. **简洁明了**：图标在小尺寸下也要清晰可辨
4. **避免文字**：如果必须使用文字，确保在 192x192 时仍然清晰

## 快速开始（使用现有 Logo）

如果你已经有 Logo SVG 文件，可以：

1. 在 Figma 或其他设计工具中打开
2. 创建一个 512x512 的画布
3. 将 Logo 居中放置，适当缩放
4. 导出为 PNG
5. 使用在线工具或命令行工具生成 192x192 版本

## 验证

生成图标后，确保：

1. 文件放在 `public/icon-192.png` 和 `public/icon-512.png`
2. 文件格式为 PNG
3. 尺寸正确（192x192 和 512x512）
4. 文件大小合理（通常每个文件 < 100KB）

完成以上步骤后，重新构建项目：`npm run build`，然后在手机上测试"添加到主屏幕"功能。


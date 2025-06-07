# GameHub 游戏网站

## 项目介绍

GameHub是一个游戏展示和管理平台，提供多种分类的在线游戏，包括前台展示界面和后台管理系统。

### 访问地址
- 网站前台：[https://www.onlinegame.run](https://www.onlinegame.run)
- 管理后台：[https://www.onlinegame.run/admin](https://www.onlinegame.run/admin)
  - 管理员用户名：admin
  - 管理员密码：Wwe5273@

## 功能特性

### 前台功能
- 游戏展示与分类筛选
- 游戏搜索功能
- 游戏详情和在线游玩
- 响应式设计，支持移动端
- 游戏分类管理与筛选

### 后台功能
- 管理员登录与权限控制
- 游戏管理（添加、编辑、删除）
- 游戏分类管理
- 游戏缩略图上传和管理
- 批量导入游戏数据

## 最近更新内容

### 2023-06-XX 更新
1. 添加了管理后台登录页面
   - 实现了用户名/密码验证
   - 添加了"记住我"功能
   - 实现了登录态验证和保持
   - 增加了退出登录功能

2. 完善了分类管理功能
   - 实现了分类的添加、编辑、删除
   - 分类关联游戏自动更新
   - 添加了分类统计和展示

3. 优化了前端分类筛选功能
   - 在顶部导航添加了分类筛选下拉框
   - 同步侧边栏与顶部筛选器的分类选择
   - 优化了分类筛选的UI和交互体验

4. 修复了游戏缩略图管理问题
   - 优化了缩略图上传和存储逻辑
   - 修复了缩略图无法正常显示的问题

## 技术栈

- 前端：HTML5, CSS3, JavaScript (ES6+)
- 框架/库：暂无
- 后端：基于浏览器本地存储
- 图像处理：HTML5 Canvas
- 版本控制：Git

## 启动说明

1. 克隆项目到本地
2. 直接打开index.html即可访问前台
3. 访问admin/index.html进入管理后台
   - 默认用户名：admin
   - 默认密码：admin123

## 开发计划

- [ ] 添加用户注册登录系统
- [ ] 实现游戏收藏和评分功能
- [ ] 增加游戏评论系统
- [ ] 添加更多游戏分类和游戏内容
- [ ] 优化移动端体验

## Features

- 🎮 1770+ online games
- 📁 222 game categories  
- 🔍 Real-time search functionality
- 📱 Responsive design
- 🎯 Modal game player
- 🎨 Modern UI/UX
- ⚙️ Admin management panel

## How to Use

1. Open `index.html` to start using
2. Use search box to find specific games
3. Click category buttons to filter games
4. Click game cards to start playing

## Admin Panel

Access the admin panel at `/admin/index.html` for complete game management:

### Admin Features:
- ✅ **Game Management**: Add, edit, delete games
- ✅ **Batch Upload**: CSV and JSON import support
- ✅ **SEO Optimization**: Built-in SEO analysis and suggestions
- ✅ **Thumbnail Management**: Upload and auto-generate game thumbnails
- ✅ **Category Management**: Organize and manage game categories
- ✅ **Data Export**: Export game data in JSON format
- ✅ **Search & Filter**: Advanced filtering options
- ✅ **Responsive Interface**: Mobile-friendly admin panel
- ✅ **Local Storage**: Persistent data management

### Admin Capabilities:
- Game CRUD operations with form validation
- Bulk import via CSV/JSON files with preview
- SEO scoring system (A+, B, C ratings)
- Auto thumbnail generation with category emojis
- Character counting for SEO fields
- Data persistence using localStorage
- Toast notifications for user feedback

## Technology Stack

- HTML5
- CSS3 (CSS Grid, Flexbox, CSS Variables, Animations)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Responsive Design (Mobile-first approach)

## Project Structure

```
/
├── index.html          # Main game website
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript functionality
├── admin/              # Admin management panel
│   ├── index.html      # Admin interface
│   ├── admin-styles.css # Admin-specific styles
│   └── admin-script.js # Admin functionality
└── README.md           # Documentation
```

## Deployment

Optimized for deployment on:
- ✅ **Vercel** (recommended) - Static hosting with serverless functions
- ✅ **Netlify** - Static site hosting
- ✅ **GitHub Pages** - Free static hosting
- ✅ **Any static hosting service**

### Deployment Features:
- No backend database required
- Static file-based architecture
- LocalStorage for admin data persistence
- CDN-ready assets

## Data Source

Game data sourced from EasyGameFind.com with iframe embed links.
All games hosted on onlinegames.io platform.

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Updates Log

### Version 2.0.2 (2025-01-29) - Vercel Deployment & CSS Fixes
- **🚀 NEW: Vercel Deployment**: Successfully deployed to Vercel with custom domain (onlinegame.run)
- **🔧 FIXED: Admin CSS**: Fixed CSS loading issues in admin panel by correcting file paths
- **🔗 Custom Domain**: Added custom domain configuration for production environment

### Version 2.0.1 (2025-01-28) - Bug Fixes & Improvements
- **🐛 FIXED: Thumbnail Upload**: Fixed issue where uploaded thumbnails were not saved properly
- **🖼️ Improved Thumbnail Display**: Better thumbnail rendering in game lists
- **🔄 Enhanced Admin UX**: Improved thumbnail preview during editing

### Version 2.0.0 (2025-01-27) - Admin Panel Release
- **🎉 NEW: Complete Admin Management System**
  - Full CRUD operations for games
  - Batch upload via CSV/JSON import
  - SEO analysis and optimization tools
  - Thumbnail upload and auto-generation
  - Category management system
  - Data export functionality
  - Responsive admin interface
  - Local storage integration

### Version 1.2.0 (2025-01-27) - English Localization
- **🌍 Full English Localization**: All interface elements converted to English
- **🔧 Code Cleanup**: Improved code organization and comments
- **📱 Mobile Optimization**: Better responsive design

### Version 1.1.0 - Modern Design Update
- **🎨 New Design**: Left sidebar navigation layout
- **🖼️ Thumbnail System**: Smart thumbnail generation with fallbacks
- **🔍 Enhanced Search**: Improved search and filtering
- **📱 Responsive Layout**: Mobile-first design approach

### Version 1.0.0 - Initial Release
- Basic game listing and categorization
- Simple search functionality
- Modal game player
- Responsive design

Build Date: 2025-01-27

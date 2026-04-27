# Music Player - 项目开发记录

## 项目概述

Spotify 风格的全功能 Web 音乐播放器，基于 Vite + React + TypeScript 构建。

## 功能清单

### 核心功能
- [x] 本地音乐导入（支持多文件选择）
- [x] 播放/暂停
- [x] 上一首/下一首
- [x] 进度条拖拽跳转
- [x] 音量控制
- [x] 随机播放
- [x] 循环模式（关闭/全部循环/单曲循环）

### 歌单管理
- [x] 创建歌单（模态框：名称/封面图片/渐变色/简介/创建者）
- [x] 删除歌单
- [x] 重命名歌单
- [x] 从音乐库添加歌曲到歌单
- [x] 从歌单移除歌曲

### 音乐库
- [x] 导入的音乐列表
- [x] 删除歌曲
- [x] 歌单浏览

### 搜索
- [x] 搜索歌曲
- [x] 搜索歌单

### Now Playing 全屏播放界面
- [x] 大尺寸专辑封面
- [x] 动态模糊渐变背景（基于封面色）
- [x] 歌曲信息（名称/艺术家/专辑）
- [x] 进度条 + 时间显示
- [x] 播放控制按钮
- [x] 音量控制
- [x] 歌曲详细信息
- [x] 返回按钮

### 快捷键
- [x] Space → 播放/暂停
- [x] → 下一首
- [x] ← 上一首
- [x] Shift + → 快进 5 秒
- [x] Shift + ← 后退 5 秒
- [x] ↑ 音量 +10%
- [x] ↓ 音量 -10%
- [x] S 切换随机
- [x] R 切换循环

### 数据持久化
- [x] 歌曲元数据 → localStorage
- [x] 歌单信息（含封面图片） → localStorage
- [x] 音频文件数据 → IndexedDB
- [x] 刷新后自动恢复所有数据

## 项目结构

```
music-player/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── CHATLOG.md
├── src/
│   ├── main.tsx                 # 入口
│   ├── App.tsx                  # 主布局 + 视图路由 + 快捷键
│   ├── App.css                  # 全部样式（Spotify 暗黑风格）
│   ├── index.css                # 全局样式 / CSS 变量
│   ├── types.ts                 # TypeScript 类型定义
│   ├── data.ts                  # 渐变色数组
│   ├── vite-env.d.ts
│   ├── lib/
│   │   └── db.ts                # IndexedDB + localStorage 持久化
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts  # 键盘快捷键
│   │   └── useAudioEngine.ts        # （未使用）
│   ├── context/
│   │   └── PlayerContext.tsx     # 全局状态管理 + 播放逻辑
│   └── components/
│       ├── Sidebar.tsx           # 左侧导航栏
│       ├── PlayerBar.tsx         # 底部播放控制栏
│       ├── NowPlayingView.tsx    # 全屏播放界面
│       ├── HomeView.tsx          # 首页
│       ├── SearchView.tsx        # 搜索页面
│       ├── LibraryView.tsx       # 音乐库
│       ├── PlaylistDetail.tsx    # 歌单详情
│       ├── TrackList.tsx         # 歌曲列表（未使用）
│       └── CreatePlaylistModal.tsx # 创建歌单模态框
```

## 开发记录摘要

1. **初始构建** - Vite + React + TS 脚手架，Spotify 暗黑风格 CSS
2. **移除模拟数据** - 去掉预置歌单/歌曲，改为用户导入
3. **导入功能** - 支持多文件上传，自动读取时长
4. **歌单管理** - 创建/删除/重命名/添加/移除歌曲
5. **搜索功能** - 搜索用户歌曲和歌单
6. **播放修复** - 移除 Web Audio API 解决浏览器自动播放限制
7. **持久化** - localStorage + IndexedDB 存储所有数据
8. **创建歌单弹窗** - 模态框：名称/封面图/渐变色/简介/创建者
9. **快捷键** - Space / → / ← / ↑ / ↓ / S / R
10. **全屏 Now Playing** - Spotify 风格全屏播放界面

## 启动方式

```bash
cd music-player
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

## 发布到 GitHub

```bash
cd music-player
git init
git add .
git commit -m "Initial commit: Spotify-style music player"
gh repo create <仓库名> --public --source=. --remote=origin --push
```

# 🎵 Music Player

Spotify 风格的全功能 Web 音乐播放器，基于 **Vite + React 18 + TypeScript** 构建。

## ✨ 功能

- **播放控制** — 播放/暂停、上一首/下一首、进度拖拽、音量调节
- **播放模式** — 随机播放、循环模式（关闭/全部循环/单曲循环）
- **歌单管理** — 创建/删除/重命名歌单，添加/移除歌曲
- **音乐导入** — 支持多文件上传，自动读取时长，数据持久化到 IndexedDB + localStorage
- **全屏 Now Playing** — Spotify 风格全屏播放界面，动态模糊渐变背景
- **搜索** — 搜索歌曲和歌单
- **键盘快捷键** — Space / → / ← / ↑ / ↓ / S / R
- **暗黑主题** — Spotify 风格暗黑 UI

## 🚀 快速开始

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`。

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Vite | 构建工具 |
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| IndexedDB | 音频文件存储 |
| localStorage | 元数据持久化 |

## 📁 项目结构

```
src/
├── main.tsx                # 入口
├── App.tsx                 # 主布局 + 视图路由 + 快捷键
├── App.css                 # 全部样式（Spotify 暗黑风格）
├── types.ts                # TypeScript 类型定义
├── data.ts                 # 渐变色数组
├── lib/db.ts               # IndexedDB + localStorage 持久化
├── hooks/                  # 自定义 Hooks
├── context/                # 全局状态管理（PlayerContext）
└── components/             # UI 组件
    ├── Sidebar.tsx
    ├── PlayerBar.tsx
    ├── NowPlayingView.tsx
    ├── HomeView.tsx
    ├── SearchView.tsx
    ├── LibraryView.tsx
    ├── PlaylistDetail.tsx
    └── CreatePlaylistModal.tsx
```

## 🔑 快捷键

| 按键 | 功能 |
|------|------|
| `Space` | 播放/暂停 |
| `→` | 下一首 |
| `←` | 上一首 |
| `Shift + →` | 快进 5 秒 |
| `Shift + ←` | 后退 5 秒 |
| `↑` | 音量 +10% |
| `↓` | 音量 -10% |
| `S` | 切换随机播放 |
| `R` | 切换循环模式 |

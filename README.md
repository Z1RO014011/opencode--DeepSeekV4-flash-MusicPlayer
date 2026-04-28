# 🎵 Jasmine Music Player

Spotify 风格的全功能 Web 音乐播放器，基于 **Vite + React 18 + TypeScript + Electron** 构建。

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

浏览器打开 `http://localhost:5173/music-player/`。

### 🖥️ 桌面应用（下载安装包）

无需安装 Node.js，直接下载对应系统的安装包运行：

| 系统 | 下载 | 说明 |
|------|------|------|
| macOS (Apple Silicon) | [Jasmine.Music.Player-1.0.0-arm64.dmg](https://github.com/Z1RO014011/opencode--DeepSeekV4-flash-MusicPlayer/releases/download/v1.0.0/Jasmine.Music.Player-1.0.0-arm64.dmg) | DMG 安装包 |
| macOS (Apple Silicon) | [Jasmine.Music.Player-1.0.0-arm64-mac.zip](https://github.com/Z1RO014011/opencode--DeepSeekV4-flash-MusicPlayer/releases/download/v1.0.0/Jasmine.Music.Player-1.0.0-arm64-mac.zip) | ZIP 便携版 |
| Windows (x64) | [Jasmine.Music.Player-1.0.0-win.zip](https://github.com/Z1RO014011/opencode--DeepSeekV4-flash-MusicPlayer/releases/download/v1.0.0/Jasmine.Music.Player-1.0.0-win.zip) | ZIP 便携版 |
| Windows (ARM64) | [Jasmine.Music.Player.1.0.0.exe](https://github.com/Z1RO014011/opencode--DeepSeekV4-flash-MusicPlayer/releases/download/v1.0.0/Jasmine.Music.Player.1.0.0.exe) | 单文件便携版 |
| Linux (ARM64) | [Jasmine.Music.Player-1.0.0-arm64.AppImage](https://github.com/Z1RO014011/opencode--DeepSeekV4-flash-MusicPlayer/releases/download/v1.0.0/Jasmine.Music.Player-1.0.0-arm64.AppImage) | AppImage 免安装 |

> 下载后直接打开即可使用，首次打开 macOS 需在 **系统设置 → 隐私与安全性** 中点"仍要打开"。

### 🛠️ 开发者模式（从源码运行）

```bash
npm install
npm run electron:dev
```

或构建安装包：

```bash
npm run electron:build
```

构建产物在 `release/` 目录。

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

## 🤖 AI 开发经验

这个项目完全由 **DeepSeek V4 Flash** 通过对话式交互生成，以下是整个协作过程的经验总结。

### 工作流程

1. **提出需求** — 描述想要的功能（如"做一个 Spotify 风格的音乐播放器"）
2. **AI 生成代码** — AI 一次性生成完整文件的代码
3. **逐文件构建** — 从项目骨架到各个组件，一个文件一个文件地生成
4. **迭代改进** — 提新需求或修改要求，AI 修改对应代码
5. **运行验证** — 边跑边测，有问题直接反馈给 AI 修复

### 关键节点

| 阶段 | 内容 |
|------|------|
| 脚手架 | Vite + React + TS 初始化 |
| 基础 UI | Spotify 暗黑风格布局（侧边栏 + 播放条 + 主内容区） |
| 播放逻辑 | HTML5 Audio 实现播放/暂停/进度/音量 |
| 导入功能 | 多文件上传 + 自动读取音频时长 |
| 歌单系统 | 创建/删除/重命名/增删歌曲 |
| 持久化 | localStorage + IndexedDB 保存一切 |
| 全屏界面 | NowPlayingView 动态模糊渐变背景 |
| 快捷键 | 键盘控制播放、音量、随机、循环 |
| 部署 | GitHub Pages + gh-pages |

### 踩坑与解决

| 问题 | 解决 |
|------|------|
| 浏览器阻止自动播放 | 移除 Web Audio API，改用 `<audio>` 元素 + user gesture 触发 |
| 音频文件存哪 | IndexedDB 存文件数据，localStorage 存元数据 |
| 刷新丢数据 | 加载时从 localStorage/IndexedDB 恢复所有状态 |
| 多个音频同时播放 | 全局单一 `<audio>` 元素，切换 src |
| 文件名杂乱 | 导入时自动提取文件名作为歌曲名，同时在 UI 显示可编辑 |

### 心得体会

- **AI 适合从零搭骨架**：让 AI 先出一个完整可运行的版本，再在此基础上迭代，比一步步问效率高得多
- **描述要具体**：需求越明确（"左侧 240px 侧边栏，三个导航项"），AI 输出越准确
- **AI 擅长 CSS**：Spotify 风格的 CSS 细节（渐变、模糊、圆角、阴影）AI 一次搞定，省了大量调样式的时间
- **Bug 修复效率高**：直接把错误信息扔给 AI，它通常能快速定位并修复
- **需要人工把关**：AI 生成的代码偶尔有冗余或小 bug，跑一遍 dev server 验证不可少
- **整个项目从零到发布 GitHub，完全是对话完成的**，没有手写过一行代码

### 给想尝试的人

这个项目证明了：**用 AI 写一个功能完整的 Web 应用是完全可行的**。你不需要精通 React 或 TypeScript，只需要：
1. 知道自己想要什么功能
2. 能把需求清晰地描述给 AI
3. 会运行 `npm install && npm run dev` 来验证
4. 遇到问题把报错复制给 AI

试试看，你也可以。🚀

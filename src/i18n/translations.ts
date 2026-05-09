export type Language = 'zh' | 'en';

export type TranslationMap = Record<string, string>;

const zh: TranslationMap = {
  // Nav
  'nav.home': '首页',
  'nav.search': '搜索',
  'nav.library': '音乐库',
  'nav.settings': '设置',

  // Actions
  'action.importMusic': '导入音乐',
  'action.createPlaylist': '创建歌单',
  'action.save': '保存',
  'action.cancel': '取消',
  'action.delete': '删除',
  'action.play': '播放',
  'action.pause': '暂停',
  'action.addSong': '添加歌曲',

  // Player
  'player.noSong': '未选择歌曲',
  'player.selectSong': '选择一首歌开始播放',
  'player.previous': '上一首',
  'player.next': '下一首',
  'player.shuffle': '随机播放',
  'player.like': '喜欢',
  'player.unlike': '取消喜欢',
  'player.repeat': '重复',
  'player.repeatOff': '关闭',
  'player.repeatAll': '全部循环',
  'player.repeatOne': '单曲循环',

  // Sidebar
  'sidebar.yourPlaylists': '你的歌单',
  'sidebar.emptyHint': '还没有歌单，点击上方创建',

  // Home
  'home.yourPlaylists': '你的歌单',
  'home.recentlyImported': '最近导入',
  'home.emptyTitle': '导入你的音乐',
  'home.emptyDesc1': '点击左侧「导入音乐」开始添加本地歌曲',
  'home.emptyDesc2': '然后创建歌单整理你的收藏',

  // Search
  'search.placeholder': '搜索歌曲、歌单...',
  'search.playlists': '歌单',
  'search.songs': '歌曲',
  'search.noResults': '未找到 "{query}" 的相关结果',
  'search.browseTitle': '搜索你的音乐',
  'search.browseHint': '在上方搜索框中输入歌曲名、艺术家或专辑名',
  'search.totalCount': '共 {songs} 首歌曲 · {playlists} 个歌单',

  // Library
  'library.title': '音乐库',
  'library.tabPlaylists': '歌单 ({count})',
  'library.tabSongs': '歌曲 ({count})',
  'library.newPlaylist': '新建歌单',
  'library.emptyPlaylists': '还没有歌单，点击上方按钮创建一个',
  'library.emptySongs': '还没有导入歌曲，点击左侧「导入音乐」添加',
  'library.headerTitle': '标题',
  'library.headerArtist': '艺术家',
  'library.headerAlbum': '专辑',
  'library.headerDuration': '时长',
  'library.headerAction': '操作',

  // Playlist
  'playlist.label': '歌单',
  'playlist.changeCover': '更换封面',
  'playlist.uploadImage': '上传图片',
  'playlist.selectImage': '选择图片',
  'playlist.orGradient': '或选渐变色',
  'playlist.save': '保存',
  'playlist.cancel': '取消',
  'playlist.addSongs': '添加歌曲',
  'playlist.deletePlaylist': '删除歌单',
  'playlist.addFromLibrary': '从音乐库添加歌曲',
  'playlist.empty': '歌单暂无歌曲',
  'playlist.removeFromPlaylist': '从歌单移除',

  // CreatePlaylistModal
  'modal.createPlaylist': '创建歌单',
  'modal.nameRequired': '请输入歌单名称',
  'modal.uploadImage': '上传图片',
  'modal.nameLabel': '歌单名称 *',
  'modal.namePlaceholder': '例如：我的最爱',
  'modal.creatorLabel': '创建者',
  'modal.creatorPlaceholder': '你的名字（选填）',
  'modal.coverColor': '封面颜色',
  'modal.fallbackColor': '封面颜色（未使用图片时的备用颜色）',
  'modal.descriptionLabel': '简介',
  'modal.descriptionPlaceholder': '描述你的歌单（选填）',

  // NowPlaying
  'np.noSong': '未选择歌曲',
  'np.clickToReturn': '点击返回',
  'np.clickForLyrics': '点击查看歌词',
  'np.editLyrics': '编辑歌词',
  'np.hideLyrics': '隐藏歌词',
  'np.showLyrics': '显示歌词',
  'np.closeLyrics': '关闭歌词',
  'np.saveLyrics': '保存歌词',
  'np.album': '专辑',
  'np.artist': '艺术家',
  'np.duration': '时长',
  'np.addLyrics': '添加歌词',
  'np.share': '分享',
  'np.shareSong': '分享歌曲',
  'np.shareCard': '分享卡片',
  'np.downloadImage': '下载图片',
  'np.generating': '生成分享卡片中...',
  'np.lrcHint': '粘贴 LRC 格式歌词（每行格式：[mm:ss.xx]歌词文本）',
  'np.lrcPlaceholder': '[00:12.50]第一句歌词\n[00:25.30]第二句歌词\n[00:42.10]第三句歌词',

  // Defaults
  'default.likedPlaylistName': '我喜欢的音乐',
  'default.likedPlaylistDesc': '收藏你喜欢的歌曲',
  'default.unknownArtist': '未知艺术家',
  'default.unknownAlbum': '未知专辑',
  'default.unknownUser': '未知用户',
  'default.playlistDescription': '{name} · 自建歌单',
  'default.importHero': '导入本地音乐，创建专属歌单',

  // Settings
  'settings.title': '设置',
  'settings.language': '语言',
  'settings.languageLabel': '界面语言',

  // Common
  'common.songCount': '{count} 首歌曲',
  'common.durationHours': '{h} 小时 {m} 分钟',
  'common.durationMinutes': '{m} 分钟',
  'common.durationApprox': '约',
};

const en: TranslationMap = {
  // Nav
  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.library': 'Library',
  'nav.settings': 'Settings',

  // Actions
  'action.importMusic': 'Import Music',
  'action.createPlaylist': 'Create Playlist',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.delete': 'Delete',
  'action.play': 'Play',
  'action.pause': 'Pause',
  'action.addSong': 'Add Song',

  // Player
  'player.noSong': 'No track selected',
  'player.selectSong': 'Select a song to start playing',
  'player.previous': 'Previous',
  'player.next': 'Next',
  'player.shuffle': 'Shuffle',
  'player.like': 'Like',
  'player.unlike': 'Unlike',
  'player.repeat': 'Repeat',
  'player.repeatOff': 'Off',
  'player.repeatAll': 'All',
  'player.repeatOne': 'One',

  // Sidebar
  'sidebar.yourPlaylists': 'Your Playlists',
  'sidebar.emptyHint': 'No playlists yet, create one above',

  // Home
  'home.yourPlaylists': 'Your Playlists',
  'home.recentlyImported': 'Recently Imported',
  'home.emptyTitle': 'Import Your Music',
  'home.emptyDesc1': 'Click "Import Music" in the sidebar to add local songs',
  'home.emptyDesc2': 'Then create playlists to organize your collection',

  // Search
  'search.placeholder': 'Search songs, playlists...',
  'search.playlists': 'Playlists',
  'search.songs': 'Songs',
  'search.noResults': 'No results found for "{query}"',
  'search.browseTitle': 'Search Your Music',
  'search.browseHint': 'Enter a song name, artist, or album in the search box above',
  'search.totalCount': '{songs} songs · {playlists} playlists',

  // Library
  'library.title': 'Library',
  'library.tabPlaylists': 'Playlists ({count})',
  'library.tabSongs': 'Songs ({count})',
  'library.newPlaylist': 'New Playlist',
  'library.emptyPlaylists': 'No playlists yet, click the button above to create one',
  'library.emptySongs': 'No songs imported yet, click "Import Music" in the sidebar',
  'library.headerTitle': 'Title',
  'library.headerArtist': 'Artist',
  'library.headerAlbum': 'Album',
  'library.headerDuration': 'Duration',
  'library.headerAction': 'Actions',

  // Playlist
  'playlist.label': 'Playlist',
  'playlist.changeCover': 'Change Cover',
  'playlist.uploadImage': 'Upload Image',
  'playlist.selectImage': 'Select Image',
  'playlist.orGradient': 'or Choose Gradient',
  'playlist.save': 'Save',
  'playlist.cancel': 'Cancel',
  'playlist.addSongs': 'Add Songs',
  'playlist.deletePlaylist': 'Delete Playlist',
  'playlist.addFromLibrary': 'Add Songs from Library',
  'playlist.empty': 'No songs in this playlist',
  'playlist.removeFromPlaylist': 'Remove from Playlist',

  // CreatePlaylistModal
  'modal.createPlaylist': 'Create Playlist',
  'modal.nameRequired': 'Please enter a playlist name',
  'modal.uploadImage': 'Upload Image',
  'modal.nameLabel': 'Playlist Name *',
  'modal.namePlaceholder': 'e.g. My Favorites',
  'modal.creatorLabel': 'Creator',
  'modal.creatorPlaceholder': 'Your name (optional)',
  'modal.coverColor': 'Cover Color',
  'modal.fallbackColor': 'Cover color (fallback when no image is used)',
  'modal.descriptionLabel': 'Description',
  'modal.descriptionPlaceholder': 'Describe your playlist (optional)',

  // NowPlaying
  'np.noSong': 'No track selected',
  'np.clickToReturn': 'Click to return',
  'np.clickForLyrics': 'Click for lyrics',
  'np.editLyrics': 'Edit Lyrics',
  'np.hideLyrics': 'Hide Lyrics',
  'np.showLyrics': 'Show Lyrics',
  'np.closeLyrics': 'Close Lyrics',
  'np.saveLyrics': 'Save Lyrics',
  'np.album': 'Album',
  'np.artist': 'Artist',
  'np.duration': 'Duration',
  'np.addLyrics': 'Add Lyrics',
  'np.share': 'Share',
  'np.shareSong': 'Share Song',
  'np.shareCard': 'Share Card',
  'np.downloadImage': 'Download Image',
  'np.generating': 'Generating share card...',
  'np.lrcHint': 'Paste LRC format lyrics (format per line: [mm:ss.xx]lyric text)',
  'np.lrcPlaceholder': '[00:12.50]First line of lyrics\n[00:25.30]Second line of lyrics\n[00:42.10]Third line of lyrics',

  // Defaults
  'default.likedPlaylistName': 'Liked Songs',
  'default.likedPlaylistDesc': 'Songs you\'ve liked',
  'default.unknownArtist': 'Unknown Artist',
  'default.unknownAlbum': 'Unknown Album',
  'default.unknownUser': 'Unknown User',
  'default.playlistDescription': '{name}',
  'default.importHero': 'Import local music, create your playlists',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.languageLabel': 'Interface Language',

  // Common
  'common.songCount': '{count} songs',
  'common.durationHours': '{h} h {m} min',
  'common.durationMinutes': '{m} min',
  'common.durationApprox': 'approx.',
};

export const translations: Record<Language, TranslationMap> = { zh, en };

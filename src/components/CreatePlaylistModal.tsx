import React, { useState, useRef } from 'react';
import { gradientColors } from '../data';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; description: string; creator: string; coverColor: string }) => void;
}

export function CreatePlaylistModal({ onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState('');
  const [selectedColor, setSelectedColor] = useState(gradientColors[0]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [useImage, setUseImage] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const coverStyle = useImage && coverImage
    ? `url(${coverImage}) center/cover no-repeat`
    : selectedColor;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      setUseImage(true);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setCoverImage(null);
    setUseImage(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: '请输入歌单名称' });
      return;
    }
    const finalCover = useImage && coverImage
      ? `url(${coverImage}) center/cover no-repeat`
      : selectedColor;
    onCreate({
      name: name.trim(),
      description: description.trim(),
      creator: creator.trim() || '未知用户',
      coverColor: finalCover,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">创建歌单</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M3.293 3.293a1 1 0 011.414 0L12 10.586l7.293-7.293a1 1 0 111.414 1.414L13.414 12l7.293 7.293a1 1 0 01-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 01-1.414-1.414L10.586 12 3.293 4.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-row">
            <div className="modal-cover-section">
              <div
                className="modal-cover-preview"
                style={{ background: coverStyle }}
              >
                {(!useImage || !coverImage) && (
                  <span className="modal-cover-icon">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                      <path d="M12 3a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 011-1z"/>
                    </svg>
                  </span>
                )}
                {useImage && coverImage && (
                  <button type="button" className="cover-remove-btn" onClick={handleRemoveImage}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3.293 3.293a1 1 0 011.414 0L12 10.586l7.293-7.293a1 1 0 111.414 1.414L13.414 12l7.293 7.293a1 1 0 01-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 01-1.414-1.414L10.586 12 3.293 4.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                )}
              </div>
              <button type="button" className="cover-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 10a1 1 0 01 1 1v6a3 3 0 01-3 3H7a3 3 0 01-3-3v-6a1 1 0 012 0v6a1 1 0 001 1h10a1 1 0 001-1v-6a1 1 0 011-1zm-7-7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L13 6.414V15a1 1 0 11-2 0V6.414L8.707 8.707a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 3z"/>
                </svg>
                上传图片
              </button>
            </div>
            <div className="modal-form-fields">
              <div className="modal-field">
                <label className="modal-label">歌单名称 *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="例如：我的最爱"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors({}); }}
                  autoFocus
                />
                {errors.name && <span className="modal-error">{errors.name}</span>}
              </div>
              <div className="modal-field">
                <label className="modal-label">创建者</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="你的名字（选填）"
                  value={creator}
                  onChange={e => setCreator(e.target.value)}
                />
              </div>
            </div>
          </div>

          {(!useImage || !coverImage) && (
            <div className="modal-field">
              <label className="modal-label">封面颜色</label>
              <div className="color-picker">
                {gradientColors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`color-swatch ${selectedColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {useImage && coverImage && (
            <div className="modal-field">
              <label className="modal-label">封面颜色（未使用图片时的备用颜色）</label>
              <div className="color-picker">
                {gradientColors.slice(0, 5).map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`color-swatch ${selectedColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="modal-field">
            <label className="modal-label">简介</label>
            <textarea
              className="modal-textarea"
              placeholder="描述你的歌单（选填）"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="modal-btn-primary">
              创建歌单
            </button>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

import { Song } from '../types';

const CARD_W = 1080;
const CARD_H = 1080;

function parseGradient(gradientStr: string): string[] {
  const match = gradientStr.match(/#[0-9a-fA-F]{6}/g);
  return match || ['#1f1f1f', '#121212'];
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateShareCard(song: Song): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;

  const colors = parseGradient(song.coverColor);
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1] || colors[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Decorative circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(CARD_W - 60, 60, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, CARD_H - 100, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Cover art area
  const coverSize = 320;
  const coverX = (CARD_W - coverSize) / 2;
  const coverY = 180;

  ctx.save();
  drawRoundRect(ctx, coverX, coverY, coverSize, coverSize, 20);
  ctx.clip();

  if (song.coverColor.startsWith('url(')) {
    const urlMatch = song.coverColor.match(/url\(([^)]+)\)/);
    if (urlMatch) {
      try {
        const img = await loadImage(urlMatch[1]);
        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
      } catch {
        drawCoverGradient(ctx, coverX, coverY, coverSize, coverSize, song.coverColor);
      }
    }
  } else {
    drawCoverGradient(ctx, coverX, coverY, coverSize, coverSize, song.coverColor);
  }
  ctx.restore();

  // Cover border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  drawRoundRect(ctx, coverX, coverY, coverSize, coverSize, 20);
  ctx.stroke();

  // Shadow under cover
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  drawRoundRect(ctx, coverX, coverY, coverSize, coverSize, 20);
  ctx.fillStyle = 'transparent';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Song title
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 64px -apple-system, "SF Pro Display", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, song.title, CARD_W / 2, coverY + coverSize + 80, CARD_W - 120, 76);

  // Artist
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '500 36px -apple-system, "SF Pro Display", "Segoe UI", sans-serif';
  ctx.fillText(song.artist, CARD_W / 2, coverY + coverSize + 180);

  // Album
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '400 28px -apple-system, "SF Pro Display", "Segoe UI", sans-serif';
  ctx.fillText(song.album, CARD_W / 2, coverY + coverSize + 230);

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CARD_W / 2 - 80, CARD_H - 120);
  ctx.lineTo(CARD_W / 2 + 80, CARD_H - 120);
  ctx.stroke();

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '500 24px -apple-system, "SF Pro Display", "Segoe UI", sans-serif';
  ctx.fillText('🎵 Jasmine Music Player', CARD_W / 2, CARD_H - 70);

  return canvas.toDataURL('image/png');
}

function drawCoverGradient(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  gradientStr: string
) {
  const colors = parseGradient(gradientStr);
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1] || colors[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Music note icon in center
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '120px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♪', x + w / 2, y + h / 2);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const chars = text.split('');
  let line = '';
  let currentY = y;
  const maxLines = 2;

  for (let n = 0; n < chars.length; n++) {
    const testLine = line + chars[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[n];
      currentY += lineHeight;
      if (currentY > y + lineHeight * (maxLines - 1)) {
        line = line.slice(0, -2) + '…';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

import { parseBlob } from 'music-metadata';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  coverDataUrl?: string;
}

export async function extractMetadata(file: File): Promise<AudioMetadata> {
  try {
    const metadata = await parseBlob(file);
    const common = metadata.common;

    let coverDataUrl: string | undefined;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      const blob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
      coverDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    return {
      title: common.title,
      artist: common.artist,
      album: common.album,
      coverDataUrl,
    };
  } catch {
    return {};
  }
}

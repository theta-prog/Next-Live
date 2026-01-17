import { Platform } from 'react-native';

/**
 * Web専用の画像生成ユーティリティ
 */

// html2canvasをWeb環境でのみ動的インポート
let html2canvas: any = null;

const loadHtml2Canvas = async () => {
  if (Platform.OS === 'web' && !html2canvas) {
    try {
      html2canvas = (await import('html2canvas')).default;
    } catch (error) {
      console.error('Failed to load html2canvas:', error);
      return null;
    }
  }
  return html2canvas;
};

/**
 * Web環境でDOMエレメントを画像として生成
 */
export const captureWebElement = async (
  element: HTMLElement,
  options?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
  }
): Promise<string | null> => {
  try {
    const html2canvasLib = await loadHtml2Canvas();
    if (!html2canvasLib) {
      throw new Error('html2canvas not available');
    }

    const canvas = await html2canvasLib(element, {
      backgroundColor: options?.backgroundColor || '#ffffff',
      scale: options?.scale || 2, // 高解像度のため
      useCORS: options?.useCORS ?? true,
      allowTaint: options?.allowTaint ?? false,
      scrollX: 0,
      scrollY: 0,
      width: options?.width,
      height: options?.height,
      // 画像読み込み待機
      imageTimeout: 5000,
      // レンダリング品質向上
      removeContainer: true,
      foreignObjectRendering: false,
    });

    return canvas.toDataURL('image/png', 0.95);
  } catch (error) {
    console.error('Web capture error:', error);
    return null;
  }
};

/**
 * Canvas APIを使って手動でカードを描画 (フォールバック)
 */
export const generateFallbackCard = async (data: {
  eventTitle: string;
  artistName: string;
  eventDate: string;
  venueName?: string;
  review?: string;
  photo?: string;
  setlist?: string;
}): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 720; // 360 * 2 for high DPI
    canvas.height = 1000; // 適切な高さ
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
      return;
    }

    // 背景色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ヘッダー部分
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, 100);

    // Next-Liveロゴ
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎵 Next-Live', canvas.width / 2, 65);

    let y = 150;

    // アーティスト名
    ctx.fillStyle = '#0095f6';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.artistName.toUpperCase(), canvas.width / 2, y);
    y += 50;

    // イベント名
    ctx.fillStyle = '#262626';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const eventLines = wrapText(ctx, data.eventTitle, canvas.width - 80);
    eventLines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, y);
      y += 50;
    });
    y += 20;

    // 日付
    const date = new Date(data.eventDate);
    const formattedDate = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillStyle = '#8e8e8e';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`📅 ${formattedDate}`, canvas.width / 2, y);
    y += 40;

    // 会場
    if (data.venueName) {
      ctx.fillText(`📍 ${data.venueName}`, canvas.width / 2, y);
      y += 50;
    }

    // 感想
    if (data.review) {
      y += 30;
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(40, y - 20, canvas.width - 80, Math.min(data.review.length * 2, 200));
      
      ctx.fillStyle = '#262626';
      ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      const reviewLines = wrapText(ctx, data.review, canvas.width - 120);
      reviewLines.slice(0, 6).forEach(line => { // 最大6行
        ctx.fillText(line, 60, y);
        y += 35;
      });
      if (reviewLines.length > 6) {
        ctx.fillText('...', 60, y);
      }
      ctx.textAlign = 'center';
      y += 30;
    }

    // セットリスト - ネタバレ防止のため共有時は非表示
    /*
    if (data.setlist) {
      y += 20;
      ctx.fillStyle = '#0095f6';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('♫ セットリスト', 60, y);
      y += 40;

      ctx.fillStyle = '#262626';
      ctx.font = '26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const songs = data.setlist.split('\n').slice(0, 5); // 最大5曲
      songs.forEach((song, index) => {
        ctx.fillText(`${index + 1}. ${song}`, 60, y);
        y += 35;
      });
    }
    */

    // フッター
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    ctx.fillStyle = '#8e8e8e';
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎵 Powered by Next-Live', canvas.width / 2, canvas.height - 25);

    resolve(canvas.toDataURL('image/png', 0.9));
  });
};

/**
 * テキストを指定幅で改行
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ').filter(word => word.trim() !== '');
  const lines: string[] = [];
  
  if (words.length === 0) {
    return [];
  }
  
  let currentLine = words[0]!;

  for (let i = 1; i < words.length; i++) {
    const word = words[i]!;
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
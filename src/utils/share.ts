import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export interface ShareContent {
  title?: string;
  message?: string;
  url?: string;
}

/**
 * 指定されたViewをキャプチャして共有可能なファイルURIを取得
 */
export const captureViewAsImage = async (
  viewRef: React.RefObject<any>,
  options?: {
    format?: 'png' | 'jpg';
    quality?: number;
  }
): Promise<string | null> => {
  try {
    if (!viewRef.current) {
      console.error('View ref is not available');
      return null;
    }

    const uri = await captureRef(viewRef, {
      format: options?.format || 'png',
      quality: options?.quality || 1,
      result: 'tmpfile',
    });

    return uri;
  } catch (error) {
    console.error('Error capturing view:', error);
    return null;
  }
};

/**
 * 画像をSNSに共有
 */
export const shareImage = async (
  imageUri: string,
  content?: ShareContent
): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Web用の共有処理
      return await shareImageOnWeb(imageUri, content);
    }

    // ネイティブアプリでの共有
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('共有不可', 'この端末では共有機能が利用できません');
      return false;
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: content?.title || '思い出を共有',
      UTI: 'public.png', // iOS用
    });

    return true;
  } catch (error) {
    console.error('Error sharing image:', error);
    Alert.alert('エラー', '共有に失敗しました');
    return false;
  }
};

/**
 * Web用の共有処理
 */
const shareImageOnWeb = async (
  imageUri: string,
  content?: ShareContent
): Promise<boolean> => {
  try {
    // Web Share API が利用可能かチェック
    if (navigator.share && navigator.canShare) {
      // base64データをBlobに変換
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const file = new File([blob], 'memory.png', { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: content?.title || '思い出を共有',
          text: content?.message,
          files: [file],
        });
        return true;
      }
    }

    // Web Share APIが使えない場合はダウンロード
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = 'memory.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.alert('画像をダウンロードしました。SNSアプリで共有してください。');
    return true;
  } catch (error) {
    console.error('Error sharing on web:', error);
    window.alert('共有に失敗しました');
    return false;
  }
};

/**
 * 共有用のメッセージを生成
 */
export const generateShareMessage = (params: {
  eventTitle?: string;
  artistName?: string;
  eventDate?: string;
  review?: string;
}): string => {
  const { eventTitle, artistName, eventDate, review } = params;
  
  let message = '🎵 ライブの思い出\n\n';
  
  if (eventTitle) {
    message += `📍 ${eventTitle}\n`;
  }
  
  if (artistName) {
    message += `🎤 ${artistName}\n`;
  }
  
  if (eventDate) {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    message += `📅 ${formattedDate}\n`;
  }
  
  if (review) {
    const truncatedReview = review.length > 100 
      ? review.substring(0, 100) + '...' 
      : review;
    message += `\n${truncatedReview}\n`;
  }
  
  message += '\n#NextLive #ライブ #思い出';
  
  return message;
};

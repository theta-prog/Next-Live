import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import Constants from 'expo-constants';

export interface ShareContent {
  title?: string;
  message?: string;
  url?: string;
}

// 開発環境の判定
const isDevelopment = __DEV__ || Constants.appOwnership === 'expo';

/**
 * デバッグログ出力
 */
const debugLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[Share Debug] ${message}`, data || '');
  }
};

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
    debugLog('Starting view capture', { platform: Platform.OS, isDevelopment });
    
    if (!viewRef.current) {
      debugLog('View ref is not available');
      
      // 開発環境用フォールバック - ダミー画像URL
      if (isDevelopment) {
        debugLog('Using development fallback image');
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      }
      
      return null;
    }

    debugLog('Capturing view with options', options);
    
    const uri = await captureRef(viewRef, {
      format: options?.format || 'png',
      quality: options?.quality || 1,
      result: 'tmpfile',
    });

    debugLog('View capture successful', { uri: uri?.substring(0, 50) + '...' });
    return uri;
  } catch (error) {
    debugLog('Error capturing view', error);
    
    // 開発環境では詳細エラーを表示
    if (isDevelopment) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (Platform.OS === 'web') {
        window.alert(`開発環境エラー: ${errorMessage}`);
      } else {
        Alert.alert('開発環境エラー', `View capture failed: ${errorMessage}`);
      }
      
      // 開発環境用フォールバック
      debugLog('Using development fallback image due to error');
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    }
    
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
    debugLog('Starting share process', { 
      platform: Platform.OS, 
      isDevelopment,
      uriLength: imageUri?.length,
      content 
    });
    
    if (Platform.OS === 'web') {
      // Web用の共有処理
      return await shareImageOnWeb(imageUri, content);
    }

    // ネイティブアプリでの共有
    debugLog('Checking sharing availability');
    const isAvailable = await Sharing.isAvailableAsync();
    debugLog('Sharing availability result', { isAvailable });
    
    if (!isAvailable) {
      const message = isDevelopment 
        ? 'この端末では共有機能が利用できません（開発環境では制限があります）'
        : 'この端末では共有機能が利用できません';
      Alert.alert('共有不可', message);
      return false;
    }

    debugLog('Attempting to share image', { imageUri: imageUri?.substring(0, 50) + '...' });
    
    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: content?.title || '思い出を共有',
      UTI: 'public.png', // iOS用
    });

    debugLog('Share successful');
    return true;
  } catch (error) {
    debugLog('Share error', error);
    
    // 開発環境では詳細エラーを表示
    if (isDevelopment) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const detailMessage = `共有に失敗しました（開発環境）\n\n詳細: ${errorMessage}\n\n解決方法:\n1. 実機でテストしてください\n2. Expo Dev Clientを使用してください\n3. プロダクションビルドで確認してください`;
      Alert.alert('開発環境エラー', detailMessage);
    } else {
      Alert.alert('エラー', '共有に失敗しました');
    }
    
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
    debugLog('Starting web share', { 
      hasNavigatorShare: !!navigator.share,
      hasCanShare: !!navigator.canShare,
      isLocalhost: location.hostname === 'localhost'
    });
    
    // 開発環境（localhost）では Web Share API が制限される場合がある
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    // Web Share API が利用可能かチェック
    if (navigator.share && navigator.canShare && !isLocalhost) {
      debugLog('Attempting Web Share API');
      
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
        debugLog('Web Share API successful');
        return true;
      }
    }

    // Web Share APIが使えない場合はダウンロード
    debugLog('Falling back to download');
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = 'memory.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const message = isDevelopment && isLocalhost
      ? '画像をダウンロードしました（開発環境ではWeb Share APIが制限されます）。\n\nSNSアプリで共有してください。'
      : '画像をダウンロードしました。SNSアプリで共有してください。';
    
    window.alert(message);
    debugLog('Download successful');
    return true;
  } catch (error) {
    debugLog('Web share error', error);
    
    if (isDevelopment) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.alert(`共有に失敗しました（開発環境）\n\n詳細: ${errorMessage}`);
    } else {
      window.alert('共有に失敗しました');
    }
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

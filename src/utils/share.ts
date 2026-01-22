import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { captureWebElement } from './webCapture';

export interface ShareContent {
  title?: string;
  message?: string;
  url?: string;
}

// 開発環境の判定
const isDevelopment = __DEV__ || Constants.appOwnership === 'expo';

/**
 * デバッグログ出力（本番では無効）
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debugLog = (_message: string, _data?: any) => {
  // ログ出力を無効化
  // if (isDevelopment) {
  //   console.log(`[Share Debug] ${message}`, data || '');
  // }
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
    
    if (Platform.OS === 'web') {
      const result = await captureWebView(viewRef, options);
      
      // Webでキャプチャが失敗した場合はフォールバックを試す
      if (!result) {
        debugLog('Web capture failed, trying fallback card generation');
        
        // 簡単なフォールバックとしてダミー画像を返す
        // 実際のプロダクションでは、generateFallbackCardを呼び出すことも可能
        if (isDevelopment) {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        }
        
        // プロダクションでは手動カード生成を試す
        try {
          const { generateFallbackCard } = await import('./webCapture');
          const fallbackImage = await generateFallbackCard({
            eventTitle: 'Live Event',
            artistName: 'Artist',
            eventDate: new Date().toISOString(),
            review: 'A memorable live experience',
          });
          return fallbackImage;
        } catch (fallbackError) {
          debugLog('Fallback card generation failed', fallbackError);
          return null;
        }
      }
      
      return result;
    }
    
    // ネイティブアプリでの処理
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
    
    // Webと同じサイズになるようにpixelRatio=2で統一（720px幅の画像を生成）
    // カードのwidth: 360px × pixelRatio: 2 = 720px幅の画像
    const uri = await captureRef(viewRef, {
      format: options?.format || 'png',
      quality: options?.quality || 1,
      result: 'tmpfile',
      // デバイスのピクセル密度に関係なく、固定のpixelRatio=2で出力
      // これによりWebのscale: 2と同じ結果になる
      snapshotContentContainer: false,
    });

    debugLog('View capture successful', { uri: uri?.substring(0, 50) + '...' });
    return uri;
  } catch (error) {
    debugLog('Error capturing view', error);
    
    // エラー処理
    if (isDevelopment) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (Platform.OS === 'web') {
        window.alert(`エラー: ${errorMessage}`);
      } else {
        Alert.alert('エラー', `画像の作成に失敗しました: ${errorMessage}`);
      }
      
      // フォールバック
      debugLog('Using fallback image due to error');
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    } else {
      // プロダクション環境ではシンプルなエラーメッセージ
      const message = '画像の作成に失敗しました。もう一度お試しください。';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('エラー', message);
      }
    }
    
    return null;
  }
};

/**
 * Web環境専用のビューキャプチャ処理
 */
const captureWebView = async (
  viewRef: React.RefObject<any>,
  options?: {
    format?: 'png' | 'jpg';
    quality?: number;
  }
): Promise<string | null> => {
  try {
    debugLog('Starting web view capture');
    
    // React Native Webでは、refからDOMエレメントを取得
    let element: HTMLElement | null = null;
    
    if (viewRef.current) {
      // React Native Web の場合、様々な方法でDOMエレメントを取得
      if (typeof viewRef.current.getDOMNode === 'function') {
        element = viewRef.current.getDOMNode();
      } else if (viewRef.current._nativeTag) {
        // DOMノードを探す
        element = document.querySelector(`[data-react-native-tag="${viewRef.current._nativeTag}"]`);
      } else if (viewRef.current instanceof HTMLElement) {
        element = viewRef.current;
      } else if (viewRef.current.getNode && typeof viewRef.current.getNode === 'function') {
        element = viewRef.current.getNode();
      }
      
      // data-testidで要素を探す
      if (!element) {
        element = document.querySelector('[data-testid="shareable-memory-card"]') as HTMLElement;
      }
      
      // モーダル内の要素を探す
      if (!element) {
        const modal = document.querySelector('[data-share-modal]');
        if (modal) {
          element = modal.querySelector('[data-testid="shareable-memory-card"]') as HTMLElement;
        }
      }
    }
    
    if (!element) {
      debugLog('DOM element not found, searching for alternatives');
      
      // クラス名で要素を探す（スタイルから推測）
      const possibleElements = [
        '[data-testid="shareable-memory-card"]',
        '.shareable-memory-card',
        '[style*="backgroundColor"]', // カードっぽい要素
        '[data-share-card]'
      ];
      
      for (const selector of possibleElements) {
        element = document.querySelector(selector) as HTMLElement;
        if (element) {
          debugLog('Found element with selector:', selector);
          break;
        }
      }
    }
    
    if (!element) {
      debugLog('No suitable element found for capture');
      return null;
    }
    
    debugLog('Found DOM element, capturing with html2canvas');
    const imageUri = await captureWebElement(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      // 要素のサイズをそのまま使用（DOM側で固定サイズを維持）
      useCORS: true,
      allowTaint: false,
    });
    
    if (imageUri) {
      debugLog('Web capture successful');
      return imageUri;
    } else {
      throw new Error('html2canvas capture failed');
    }
  } catch (error) {
    debugLog('Web capture error, will try fallback', error);
    return null; // フォールバックは呼び出し元で処理
  }
};

/**
 * 画像をSNSに共有
 */
export const shareImage = async (
  imageUri: string,
  content?: ShareContent,
  onDownloadComplete?: () => void
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
      return await shareImageOnWeb(imageUri, content, onDownloadComplete);
    }

    // ネイティブアプリでの共有
    debugLog('Checking sharing availability');
    const isAvailable = await Sharing.isAvailableAsync();
    debugLog('Sharing availability result', { isAvailable });
    
    if (!isAvailable) {
      Alert.alert('共有不可', 'この端末では共有機能が利用できません。');
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
    
    // エラー処理
    const errorMessage = isDevelopment && error instanceof Error 
      ? `共有に失敗しました\n\n詳細: ${error.message}`
      : '共有に失敗しました。もう一度お試しください。';
    Alert.alert('エラー', errorMessage);
    
    return false;
  }
};

/**
 * Web用の共有処理
 */
const shareImageOnWeb = async (
  imageUri: string,
  content?: ShareContent,
  onDownloadComplete?: () => void
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
    
    // カスタムモーダル表示のコールバックを呼び出す
    if (onDownloadComplete) {
      onDownloadComplete();
    }
    
    debugLog('Download successful');
    return true;
  } catch (error) {
    debugLog('Web share error', error);
    
    // エラー時はアラートを表示
    const errorMessage = '共有に失敗しました。ブラウザを更新してから再度お試しください。';
      
    window.alert(errorMessage);
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

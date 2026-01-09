import { Platform } from 'react-native';

/**
 * ファイルシステム操作のユーティリティ関数
 */

/**
 * 画像ファイルをBase64形式に変換する
 * @param uri 画像ファイルのURI
 * @returns Base64エンコードされた画像データ
 */
export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // Webの場合の処理
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Native (iOS/Android)の場合の処理
    // React Nativeでは、fetch APIを使用してローカルファイルを読み込むことができます
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Base64画像データのサイズを計算する（参考値）
 * @param base64Data Base64エンコードされた画像データ
 * @returns サイズ（バイト）
 */
export const getBase64ImageSize = (base64Data: string): number => {
  // Base64データのサイズを概算計算
  const base64Content = base64Data.split(',')[1] || base64Data;
  return Math.round((base64Content.length * 3) / 4);
};

/**
 * 画像サイズが制限を超えているかチェック
 * @param base64Data Base64エンコードされた画像データ
 * @param maxSizeInMB 最大サイズ（MB）
 * @returns サイズ制限を超えているかどうか
 */
export const isImageSizeExceeded = (base64Data: string, maxSizeInMB: number = 5): boolean => {
  const sizeInBytes = getBase64ImageSize(base64Data);
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB > maxSizeInMB;
};
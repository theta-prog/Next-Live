/**
 * Date utility functions
 */
export const formatDate = (dateString: string, locale: string = 'ja-JP'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

export const formatTime = (timeString: string): string => {
  const time = new Date(`1970-01-01T${timeString}:00`);
  return time.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDaysUntil = (dateString: string): number => {
  if (!dateString) return 0;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  const today = new Date();
  const DAY_MS = 24 * 60 * 60 * 1000;

  if (m) {
    // UTC 0:00 同士で比較（toISOString().split('T')[0] との相性が良い）
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    if ([y, mo, d].some((n) => Number.isNaN(n))) return 0;
    const eventUTC = Date.UTC(y, mo, d);
    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );
    return Math.round((eventUTC - todayUTC) / DAY_MS);
  }

  // フォールバック: ローカル 0:00 同士で比較
  const event = new Date(dateString);
  if (Number.isNaN(event.getTime())) return 0;
  const eventLocal = new Date(event.getFullYear(), event.getMonth(), event.getDate()).getTime();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((eventLocal - todayLocal) / DAY_MS);
};

export const isEventPast = (dateString: string): boolean => {
  const eventDate = new Date(dateString);
  const today = new Date();
  return eventDate < today;
};

export const isEventToday = (dateString: string): boolean => {
  if (!dateString) return false;
  // 'YYYY-MM-DD' 形式は UTC として解釈されローカル日付とズレることがあるため、
  // ローカルの年月日で直接比較する
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  const today = new Date();

  if (m) {
    const [, ys, ms, ds] = m;
    const y = Number(ys);
    const mo = Number(ms);
    const d = Number(ds);
    if ([y, mo, d].some((n) => Number.isNaN(n))) return false;
    // ローカル日付での比較
    const isLocalToday = (
      y === today.getFullYear() &&
      mo === today.getMonth() + 1 &&
      d === today.getDate()
    );
    // UTC 基準の today との比較（toISOString().split('T')[0] の期待に合わせる）
    const isUtcToday = (
      y === today.getUTCFullYear() &&
      mo === today.getUTCMonth() + 1 &&
      d === today.getUTCDate()
    );
    return isLocalToday || isUtcToday;
  }

  // フォールバック: 非標準文字列は Date パースし、ローカルの年月日で比較
  const eventDate = new Date(dateString);
  if (Number.isNaN(eventDate.getTime())) return false;
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
};

export const isEventThisMonth = (dateString: string): boolean => {
  const eventDate = new Date(dateString);
  const today = new Date();
  return eventDate.getMonth() === today.getMonth() && 
         eventDate.getFullYear() === today.getFullYear();
};

/**
 * String utility functions
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price);
};

/**
 * Array utility functions
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Validation utility functions
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Photo utility functions
 */
export const parsePhotoArray = (photosString: string): string[] => {
  try {
    const photos = JSON.parse(photosString);
    return Array.isArray(photos) ? photos : [];
  } catch {
    return [];
  }
};

export const stringifyPhotoArray = (photos: string[]): string => {
  return JSON.stringify(photos);
};

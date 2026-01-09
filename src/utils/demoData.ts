// 開発環境用のデモ思い出データ
export const DEMO_MEMORY = {
  id: 'demo-memory-1',
  event_title: 'SUMMER SONIC 2024',
  artist_name: 'ONE OK ROCK',
  event_date: '2024-08-17',
  venue_name: 'ZOZOマリンスタジアム',
  review: '最高のライブでした！アツい演奏とMCで会場全体が一つになった瞬間は忘れられません。新曲も披露してくれて、ファンとしてとても嬉しかったです。',
  setlist: 'Make Me Happy\nStand Out Fit In\nWasted Nights\nWherever You Are\nThe Beginning',
  photos: JSON.stringify([
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop'
  ]),
  created_at: '2024-08-17T20:00:00.000Z',
  updated_at: '2024-08-17T20:00:00.000Z',
  sync_status: 'synced' as const,
  live_event_id: 'demo-event-1',
};

export const DEMO_EVENT = {
  id: 'demo-event-1',
  title: 'SUMMER SONIC 2024',
  artist_id: 'demo-artist-1',
  date: '2024-08-17T18:00:00.000Z',
  venue_name: 'ZOZOマリンスタジアム',
  venue_address: '千葉県千葉市美浜区美浜1',
  doors_open: '16:00',
  show_start: '18:00',
  ticket_status: 'won' as const,
  ticket_price: 9800,
  seat_number: 'A-12 列 34番',
  memo: '友達と一緒に参加。天気も良くて最高でした！',
  created_at: '2024-08-17T00:00:00.000Z',
  updated_at: '2024-08-17T00:00:00.000Z',
  sync_status: 'synced' as const,
};
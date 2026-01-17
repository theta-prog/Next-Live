import { Artist, LiveEvent, Memory } from '../database/asyncDatabase';
import client from './client';

export const artistService = {
  getAll: async (): Promise<Artist[]> => {
    const response = await client.get<{ items: any[] }>('/v1/artists');
    return response.data.items.map(item => ({
      ...item,
      social_media: item.socialMedia,
      photo: item.photoUrl,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }));
  },

  getById: async (id: string): Promise<Artist> => {
    const response = await client.get<any>(`/v1/artists/${id}`);
    const item = response.data;
    return {
      ...item,
      social_media: item.socialMedia,
      photo: item.photoUrl,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  },

  create: async (data: Partial<Artist>): Promise<Artist> => {
    const payload = {
      name: data.name,
      website: data.website,
      socialMedia: data.social_media,
      photoUrl: data.photo,
    };
    const response = await client.post<any>('/v1/artists', payload);
    const item = response.data;
    return {
      ...item,
      social_media: item.socialMedia,
      photo: item.photoUrl,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  },

  update: async (id: string, data: Partial<Artist>): Promise<Artist> => {
    const payload = {
      name: data.name,
      website: data.website,
      socialMedia: data.social_media,
      photoUrl: data.photo,
    };
    const response = await client.patch<any>(`/v1/artists/${id}`, payload);
    const item = response.data;
    return {
      ...item,
      social_media: item.socialMedia,
      photo: item.photoUrl,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/v1/artists/${id}`);
  },
};

export const liveEventService = {
  getAll: async (): Promise<LiveEvent[]> => {
    const response = await client.get<{ items: any[] }>('/v1/live-events');
    return response.data.items.map(item => ({
      ...item,
      artist_id: item.artistId,
      venue_name: item.venue,
      venue_address: item.venueAddress,
      doors_open: item.doorsOpen,
      show_start: item.showStart,
      ticket_status: item.ticketStatus,
      ticket_price: item.ticketPrice,
      seat_number: item.seatNumber,
      memo: item.memo,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }));
  },

  getById: async (id: string): Promise<LiveEvent> => {
    const response = await client.get<any>(`/v1/live-events/${id}`);
    const item = response.data;
    return {
      ...item,
      artist_id: item.artistId,
      venue_name: item.venue,
      venue_address: item.venueAddress,
      doors_open: item.doorsOpen,
      show_start: item.showStart,
      ticket_status: item.ticketStatus,
      ticket_price: item.ticketPrice,
      seat_number: item.seatNumber,
      memo: item.memo,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  },

  create: async (data: Partial<LiveEvent>): Promise<LiveEvent> => {
    const payload = {
      title: data.title,
      artistId: data.artist_id,
      date: data.date,
      venue: data.venue_name,
      venueAddress: data.venue_address,
      doorsOpen: data.doors_open,
      showStart: data.show_start,
      ticketStatus: data.ticket_status,
      ticketPrice: data.ticket_price,
      seatNumber: data.seat_number,
      memo: data.memo,
    };
    const response = await client.post<any>('/v1/live-events', payload);
    const item = response.data;
    return {
      ...item,
      artist_id: item.artistId,
      venue_name: item.venue,
      venue_address: item.venueAddress,
      doors_open: item.doorsOpen,
      show_start: item.showStart,
      ticket_status: item.ticketStatus,
      ticket_price: item.ticketPrice,
      seat_number: item.seatNumber,
      memo: item.memo,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  },

  update: async (id: string, data: Partial<LiveEvent>): Promise<LiveEvent> => {
    const payload = {
      title: data.title,
      artistId: data.artist_id,
      date: data.date,
      venue: data.venue_name,
      venueAddress: data.venue_address,
      doorsOpen: data.doors_open,
      showStart: data.show_start,
      ticketStatus: data.ticket_status,
      ticketPrice: data.ticket_price,
      seatNumber: data.seat_number,
      memo: data.memo,
    };
    const response = await client.patch<any>(`/v1/live-events/${id}`, payload);
    const item = response.data;
    return {
      ...item,
      artist_id: item.artistId,
      venue_name: item.venue,
      venue_address: item.venueAddress,
      doors_open: item.doorsOpen,
      show_start: item.showStart,
      ticket_status: item.ticketStatus,
      ticket_price: item.ticketPrice,
      seat_number: item.seatNumber,
      memo: item.memo,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/v1/live-events/${id}`);
  },
};

export const memoryService = {
  getAll: async (): Promise<Memory[]> => {
    const response = await client.get<{ items: any[] }>('/v1/memories');
    return response.data.items.map(item => ({
      ...item,
      live_event_id: item.eventId,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      photos: item.photos ? JSON.stringify(item.photos) : undefined,
    }));
  },

  getByEventId: async (eventId: string): Promise<Memory | null> => {
    // Assuming we filter client-side for now as per previous thought
    const all = await memoryService.getAll();
    return all.find(m => m.live_event_id === eventId) || null;
  },

  create: async (data: Partial<Memory>): Promise<Memory> => {
    const payload = {
      eventId: data.live_event_id,
      review: data.review,
      setlist: data.setlist,
      photos: data.photos ? JSON.parse(data.photos) : [],
    };
    const response = await client.post<any>('/v1/memories', payload);
    const item = response.data;
    return {
      ...item,
      live_event_id: item.eventId,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      photos: item.photos ? JSON.stringify(item.photos) : undefined,
    };
  },

  update: async (id: string, data: Partial<Memory>): Promise<Memory> => {
    const payload = {
      eventId: data.live_event_id,
      review: data.review,
      setlist: data.setlist,
      photos: data.photos ? JSON.parse(data.photos) : undefined,
    };
    const response = await client.patch<any>(`/v1/memories/${id}`, payload);
    const item = response.data;
    return {
      ...item,
      live_event_id: item.eventId,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      photos: item.photos ? JSON.stringify(item.photos) : undefined,
    };
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/v1/memories/${id}`);
  },

  createShareLink: async (id: string): Promise<{ shareToken: string }> => {
    const response = await client.post<{ shareToken: string }>(`/v1/memories/${id}/share`);
    return response.data;
  },

  getSharedByToken: async (token: string): Promise<Memory & { event_title: string; artist_name: string; event_date: string; venue_name?: string }> => {
    const response = await client.get<any>(`/v1/public/memories/${token}`);
    const item = response.data;
    return {
      ...item,
      live_event_id: item.eventId || item.event?.id,
      event_title: item.event?.title || 'Unknown Event',
      artist_name: item.event?.artist?.name || 'Unknown Artist',
      event_date: item.event?.date || '',
      venue_name: item.event?.venue || item.event?.venue_name,
      created_at: item.createdAt || item.created_at,
      updated_at: item.updatedAt || item.updated_at,
      photos: item.photos ? JSON.stringify(item.photos) : undefined,
    };
  },
};

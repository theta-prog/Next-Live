// Test script to add some live events for calendar testing
const { database } = require('../src/database/asyncDatabase.ts');

async function addTestLiveEvents() {
  try {
    // First, let's create some test artists
    const artist1 = await database.createArtist({
      name: 'Test Artist 1',
      website: 'https://example.com',
      social_media: '@testartist1',
    });

    const artist2 = await database.createArtist({
      name: 'Test Artist 2',
      website: 'https://example2.com',
      social_media: '@testartist2',
    });

    console.log('Created artists:', [artist1, artist2]);

    // Create some live events for testing the calendar
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const events = [
      {
        title: 'Today Concert',
        artist_id: artist1.id,
        date: today.toISOString().split('T')[0], // YYYY-MM-DD format
        venue_name: 'Test Venue 1',
        venue_address: 'Test Address 1',
        doors_open: '18:00',
        show_start: '19:00',
      },
      {
        title: 'Tomorrow Show',
        artist_id: artist2.id,
        date: tomorrow.toISOString().split('T')[0],
        venue_name: 'Test Venue 2',
        venue_address: 'Test Address 2',
        doors_open: '17:30',
        show_start: '18:30',
      },
      {
        title: 'Next Week Festival',
        artist_id: artist1.id,
        date: nextWeek.toISOString().split('T')[0],
        venue_name: 'Festival Ground',
        venue_address: 'Festival Address',
        doors_open: '16:00',
        show_start: '17:00',
      },
      {
        title: 'Next Month Live',
        artist_id: artist2.id,
        date: nextMonth.toISOString().split('T')[0],
        venue_name: 'Big Hall',
        venue_address: 'Big Hall Address',
        doors_open: '19:00',
        show_start: '20:00',
      }
    ];

    for (const event of events) {
      const createdEvent = await database.createLiveEvent(event);
      console.log('Created event:', createdEvent);
    }

    // List all events to verify
    const allEvents = await database.getLiveEventsWithArtists();
    console.log('All events with artists:', allEvents);

    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Run the script
addTestLiveEvents();
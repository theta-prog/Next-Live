import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { useApp } from '../../context/AppContext';
import HomeScreen from '../../screens/HomeScreen';

// Mock the useApp hook
jest.mock('../../context/AppContext');
const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
  goBack: jest.fn(),
};

describe('HomeScreen', () => {
  const mockUpcomingEvents = [
    {
      id: 1,
      title: 'Test Concert',
      date: '2024-12-25',
      venue_name: 'Test Venue',
      artist_id: 1,
      artist_name: 'Test Artist',
      created_at: '2023-01-01T00:00:00.000Z',
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: mockUpcomingEvents,
      addArtist: jest.fn(),
      updateArtist: jest.fn(),
      deleteArtist: jest.fn(),
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      memories: [],
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Next Live')).toBeTruthy();
  });

  it('displays upcoming events', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Test Concert')).toBeTruthy();
    expect(getByText('Test Venue')).toBeTruthy();
    expect(getByText('Test Artist')).toBeTruthy();
  });

  it('displays empty state when no events', () => {
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      addArtist: jest.fn(),
      updateArtist: jest.fn(),
      deleteArtist: jest.fn(),
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      memories: [],
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('予定されているライブがありません')).toBeTruthy();
  });

  it('renders basic screen functionality', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // Just check that the screen renders without errors
    expect(getByText('Next Live')).toBeTruthy();
  });

  it('calculates and displays countdown correctly', () => {
    // Mock today's date
    const mockToday = new Date('2024-12-20');
    const realDate = Date;
    
    global.Date = jest.fn((dateString?: string) => {
      if (dateString) {
        return new realDate(dateString);
      }
      return mockToday;
    }) as any;
    
    global.Date.now = jest.fn(() => mockToday.getTime());

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // Event is 5 days away (2024-12-25 - 2024-12-20 = 5 days)
    expect(getByText('5')).toBeTruthy();
    expect(getByText('あと')).toBeTruthy();
    expect(getByText('日')).toBeTruthy();

    // Restore original Date
    global.Date = realDate;
  });

  it('navigates to event detail when detail button is pressed', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const detailButton = getByText('詳細を見る');
    fireEvent.press(detailButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('LiveEventDetail', { 
      eventId: mockUpcomingEvents[0].id 
    });
  });

  it('displays event information correctly', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('次のライブ')).toBeTruthy();
    expect(getByText('Test Concert')).toBeTruthy();
    expect(getByText('Test Artist')).toBeTruthy();
    expect(getByText('Test Venue')).toBeTruthy();
  });

  it('displays formatted date correctly', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // The date should be formatted in Japanese locale
    expect(getByText('2024年12月25日水曜日')).toBeTruthy();
  });

  it('displays header content correctly', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByText('Next Live')).toBeTruthy();
    expect(getByText('お気に入りのアーティストを管理')).toBeTruthy();
  });

  it('handles multiple upcoming events correctly', () => {
    const multipleEvents = [
      ...mockUpcomingEvents,
      {
        id: 2,
        title: 'Second Concert',
        date: '2024-12-26',
        venue_name: 'Second Venue',
        artist_id: 2,
        artist_name: 'Second Artist',
        created_at: '2023-01-02T00:00:00.000Z',
      }
    ];

    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: multipleEvents,
      addArtist: jest.fn(),
      updateArtist: jest.fn(),
      deleteArtist: jest.fn(),
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      memories: [],
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // Should show the first (next) event
    expect(getByText('Test Concert')).toBeTruthy();
    // Multiple events test - implementation may show multiple events or just the first one
  });
});

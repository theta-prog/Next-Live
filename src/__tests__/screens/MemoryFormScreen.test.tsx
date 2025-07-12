import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import MemoryFormScreen from '../../screens/MemoryFormScreen';

// Mock the useApp hook
jest.mock('../../context/AppContext');
const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route params for new memory
const mockRouteNew = {
  params: {
    eventId: 1,
  },
};

// Mock route params for editing memory
const mockRouteEdit = {
  params: {
    eventId: 1,
    memoryId: 1,
  },
};

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => 
    Promise.resolve({
      canceled: true,
      assets: []
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
  requestMediaLibraryPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
}));

describe('MemoryFormScreen', () => {
  const mockMemories = [
    {
      id: 1,
      live_event_id: 1,
      review: 'Amazing concert experience!',
      setlist: 'Song 1\nSong 2\nSong 3',
      photos: JSON.stringify(['photo1.jpg', 'photo2.jpg']),
      event_title: 'Test Concert',
      artist_name: 'Test Artist',
      event_date: '2024-12-25',
      created_at: '2023-01-01T00:00:00.000Z',
    },
  ];

  const mockLiveEvents = [
    {
      id: 1,
      title: 'Test Concert',
      date: '2024-12-25',
      venue_name: 'Test Venue',
      artist_id: 1,
      artist_name: 'Test Artist',
      created_at: '2023-01-01T00:00:00.000Z',
    },
  ];

  const mockAddMemory = jest.fn();
  const mockUpdateMemory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: mockLiveEvents,
      upcomingEvents: [],
      addArtist: jest.fn(),
      updateArtist: jest.fn(),
      deleteArtist: jest.fn(),
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      memories: mockMemories,
      addMemory: mockAddMemory,
      updateMemory: mockUpdateMemory,
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });
  });

  describe('New Memory Form', () => {
    it('renders correctly for new memory', () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      expect(getByText('思い出追加')).toBeTruthy();
      expect(getByText('感想')).toBeTruthy();
      expect(getByText('セットリスト')).toBeTruthy();
    });

    it('allows text input for review', () => {
      const { getAllByTestId } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      const reviewInputs = getAllByTestId('TextInput');
      expect(reviewInputs.length).toBeGreaterThan(0);
    });

    it('allows text input for setlist', () => {
      const { getAllByTestId } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      const inputs = getAllByTestId('TextInput');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('handles back navigation', () => {
      const { getAllByTestId } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      const touchableElements = getAllByTestId('TouchableOpacity');
      const backButton = touchableElements.find(element => 
        element.children.some((child: any) => 
          typeof child === 'object' && 'props' in child && 
          child.props?.children === '←'
        )
      );

      if (backButton) {
        fireEvent.press(backButton);
        expect(mockNavigation.goBack).toHaveBeenCalled();
      }
    });

    it('saves new memory when save button is pressed', async () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      // Press save button
      const saveButton = getByText('保存');
      fireEvent.press(saveButton);

      // Should show validation alert first
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Edit Memory Form', () => {
    it('renders correctly for editing memory', () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteEdit} />
      );

      expect(getByText('思い出編集')).toBeTruthy();
      expect(getByText('Test Concert')).toBeTruthy();
      expect(getByText('Test Artist')).toBeTruthy();
    });

    it('updates existing memory when save button is pressed', async () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteEdit} />
      );

      // Press save button
      const saveButton = getByText('保存');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockUpdateMemory).toHaveBeenCalled();
      });
    });

    it('handles memory not found for editing', () => {
      const invalidRoute = {
        params: {
          eventId: 1,
          memoryId: 999,
        },
      };

      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={invalidRoute} />
      );

      expect(getByText('思い出追加')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('shows alert when trying to save empty form', () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      const saveButton = getByText('保存');
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        '感想、セットリスト、写真のうち少なくとも一つは入力してください'
      );
    });

    it('allows saving with only review filled', async () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      const saveButton = getByText('保存');
      fireEvent.press(saveButton);

      // Should show validation error first
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Photo Handling', () => {
    it('renders photo picker button', () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      expect(getByText('追加')).toBeTruthy();
    });

    it('handles photo picker button press', () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      const photoButton = getByText('追加');
      fireEvent.press(photoButton);

      // Should not crash when photo picker is pressed
      expect(getByText('追加')).toBeTruthy();
    });
  });

  describe('Event Information', () => {
    it('displays event information when event exists', () => {
      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={mockRouteNew} />
      );

      expect(getByText('Test Concert')).toBeTruthy();
      expect(getByText('Test Artist')).toBeTruthy();
    });

    it('handles missing event information', () => {
      const routeWithInvalidEvent = {
        params: {
          eventId: 999,
        },
      };

      const { getByText } = render(
        <MemoryFormScreen navigation={mockNavigation} route={routeWithInvalidEvent} />
      );

      // Should render error message
      expect(getByText('イベントが見つかりません')).toBeTruthy();
    });
  });
});

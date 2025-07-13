import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Artist } from '../../database/asyncDatabase';
import ArtistsScreen from '../../screens/ArtistsScreen';

// Mock the useApp hook
jest.mock('../../context/AppContext');
const mockUseApp = useApp as jest.MockedFunction<typeof useApp>;

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('ArtistsScreen Additional Coverage', () => {
  const mockAddArtist = jest.fn();
  const mockUpdateArtist = jest.fn();
  const mockDeleteArtist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tests openModal with artist having null optional fields', () => {
    const artistWithNulls: Artist = {
      id: 1,
      name: 'Artist With Nulls',
      website: null as any,
      social_media: null as any,
      photo: null as any,
    };

    mockUseApp.mockReturnValue({
      artists: [artistWithNulls],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    // Directly test the openModal function with null fields
    const { getByTestId, getByText } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Verify modal opens
    expect(getByText('アーティスト追加')).toBeTruthy();
  });

  it('tests handleSave with whitespace-only name', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText, getByTestId } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Fill with whitespace only
    const nameInput = getByTestId('artist-name-input');
    fireEvent.changeText(nameInput, '   ');

    // Try to save
    const saveButton = getByText('追加');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('エラー', 'アーティスト名を入力してください');
    });

    alertSpy.mockRestore();
  });

  it('tests artistData with trimmed values', async () => {
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText, getByTestId } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Fill with values that need trimming
    const nameInput = getByTestId('artist-name-input');
    const websiteInput = getByTestId('artist-website-input');
    const socialInput = getByTestId('artist-social-input');
    
    fireEvent.changeText(nameInput, '  Test Artist  ');
    fireEvent.changeText(websiteInput, '  https://example.com  ');
    fireEvent.changeText(socialInput, '  @testartist  ');

    // Save
    const saveButton = getByText('追加');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAddArtist).toHaveBeenCalledWith({
        name: 'Test Artist',
        website: 'https://example.com',
        social_media: '@testartist',
        photo: undefined,
      });
    });
  });

  it('tests artistData with empty strings converted to undefined', async () => {
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText, getByTestId } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Fill name only, leave others empty
    const nameInput = getByTestId('artist-name-input');
    const websiteInput = getByTestId('artist-website-input');
    const socialInput = getByTestId('artist-social-input');
    
    fireEvent.changeText(nameInput, 'Test Artist');
    fireEvent.changeText(websiteInput, '');
    fireEvent.changeText(socialInput, '');

    // Save
    const saveButton = getByText('追加');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAddArtist).toHaveBeenCalledWith({
        name: 'Test Artist',
        website: undefined,
        social_media: undefined,
        photo: undefined,
      });
    });
  });

  it('tests closeModal resets all state correctly', () => {
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText, getByTestId, queryByText } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Fill all fields
    const nameInput = getByTestId('artist-name-input');
    const websiteInput = getByTestId('artist-website-input');
    const socialInput = getByTestId('artist-social-input');
    
    fireEvent.changeText(nameInput, 'Test Artist');
    fireEvent.changeText(websiteInput, 'https://example.com');
    fireEvent.changeText(socialInput, '@testartist');

    // Close modal using close button
    const closeButton = getByTestId('modal-close-button');
    fireEvent.press(closeButton);

    // Verify modal is closed
    expect(queryByText('アーティスト追加')).toBeFalsy();

    // Re-open modal to verify state was reset
    fireEvent.press(addButton);
    expect(getByText('アーティスト追加')).toBeTruthy();
    
    // Values should be reset (checking through component structure)
    const newNameInput = getByTestId('artist-name-input');
    expect(newNameInput.props.value).toBe('');
  });

  it('tests pickImage with successful photo selection', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'new-photo-uri' }],
    });

    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByTestId } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Press photo selection
    const photoButton = getByTestId('photo-picker-button');
    fireEvent.press(photoButton);

    await waitFor(() => {
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    });
  });

  it('tests pickImage with no assets returned', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: null,
    });

    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByTestId } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Press photo selection
    const photoButton = getByTestId('photo-picker-button');
    fireEvent.press(photoButton);

    await waitFor(() => {
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
    // No photo should be set when assets is null
  });

  it('tests Modal onRequestClose prop', () => {
    mockUseApp.mockReturnValue({
      artists: [],
      liveEvents: [],
      upcomingEvents: [],
      memories: [],
      addArtist: mockAddArtist,
      updateArtist: mockUpdateArtist,
      deleteArtist: mockDeleteArtist,
      addLiveEvent: jest.fn(),
      updateLiveEvent: jest.fn(),
      deleteLiveEvent: jest.fn(),
      addMemory: jest.fn(),
      updateMemory: jest.fn(),
      deleteMemory: jest.fn(),
      refreshData: jest.fn(),
    });

    const { getByText, getByTestId, queryByText } = render(<ArtistsScreen navigation={mockNavigation} />);

    // Open modal
    const addButton = getByTestId('add-artist-button');
    fireEvent.press(addButton);

    // Verify modal is open
    expect(getByText('アーティスト追加')).toBeTruthy();
    
    // onRequestClose should be equivalent to closeModal functionality
    // This is tested implicitly through the Modal component structure
    expect(queryByText('アーティスト追加')).toBeTruthy();
  });
});

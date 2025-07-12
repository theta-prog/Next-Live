import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Button, Card } from '../../components/UI';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('UI Components', () => {
  describe('Card Component', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <Card>
          <Button title="Test Button" onPress={() => {}} />
        </Card>
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <Card style={customStyle} testID="test-card">
          <Button title="Test" onPress={() => {}} />
        </Card>
      );

      const card = getByTestId('test-card');
      expect(card.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customStyle)
        ])
      );
    });

    it('renders elevated variant correctly', () => {
      const { getByTestId } = render(
        <Card variant="elevated" testID="elevated-card">
          <Button title="Test" onPress={() => {}} />
        </Card>
      );

      const card = getByTestId('elevated-card');
      expect(card).toBeTruthy();
    });

    it('renders outlined variant correctly', () => {
      const { getByTestId } = render(
        <Card variant="outlined" testID="outlined-card">
          <Button title="Test" onPress={() => {}} />
        </Card>
      );

      const card = getByTestId('outlined-card');
      expect(card).toBeTruthy();
    });

    it('applies no padding when noPadding is true', () => {
      const { getByTestId } = render(
        <Card noPadding testID="no-padding-card">
          <Button title="Test" onPress={() => {}} />
        </Card>
      );

      const card = getByTestId('no-padding-card');
      expect(card).toBeTruthy();
    });
  });

  describe('Button Component', () => {
    const mockOnPress = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders button title correctly', () => {
      const { getByText } = render(
        <Button title="Test Button" onPress={mockOnPress} />
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const { getByText } = render(
        <Button title="Test Button" onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('renders primary variant by default', () => {
      const { getByTestId } = render(
        <Button title="Primary" onPress={mockOnPress} testID="primary-button" />
      );

      const button = getByTestId('primary-button');
      expect(button).toBeTruthy();
    });

    it('renders secondary variant correctly', () => {
      const { getByTestId } = render(
        <Button 
          title="Secondary" 
          onPress={mockOnPress} 
          variant="secondary"
          testID="secondary-button" 
        />
      );

      const button = getByTestId('secondary-button');
      expect(button).toBeTruthy();
    });

    it('renders outline variant correctly', () => {
      const { getByTestId } = render(
        <Button 
          title="Outline" 
          onPress={mockOnPress} 
          variant="outline"
          testID="outline-button" 
        />
      );

      const button = getByTestId('outline-button');
      expect(button).toBeTruthy();
    });

    it('handles disabled state correctly', () => {
      const { getByTestId } = render(
        <Button 
          title="Disabled" 
          onPress={mockOnPress} 
          disabled
          testID="disabled-button" 
        />
      );

      const button = getByTestId('disabled-button');
      expect(button.props.disabled).toBe(true);
    });

    it('applies full width style', () => {
      const { getByTestId } = render(
        <Button 
          title="Full Width" 
          onPress={mockOnPress} 
          fullWidth
          testID="full-width-button" 
        />
      );

      const button = getByTestId('full-width-button');
      expect(button).toBeTruthy();
    });

    it('renders different sizes correctly', () => {
      const { getByTestId: getByTestIdSmall } = render(
        <Button 
          title="Small" 
          onPress={mockOnPress} 
          size="small"
          testID="small-button" 
        />
      );

      const { getByTestId: getByTestIdLarge } = render(
        <Button 
          title="Large" 
          onPress={mockOnPress} 
          size="large"
          testID="large-button" 
        />
      );

      expect(getByTestIdSmall('small-button')).toBeTruthy();
      expect(getByTestIdLarge('large-button')).toBeTruthy();
    });
  });
});

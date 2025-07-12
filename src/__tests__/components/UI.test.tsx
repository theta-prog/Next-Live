import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Button, Card, CustomTextInput, SectionHeader } from '../../components/UI';

describe('UI Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      const { getByTestId } = render(
        <Card testID="test-card">
          <Text>Test Content</Text>
        </Card>
      );
      expect(getByTestId('test-card')).toBeTruthy();
    });

    it('applies custom styles', () => {
      const { getByTestId } = render(
        <Card testID="test-card" variant="elevated">
          <Text>Test Content</Text>
        </Card>
      );
      
      const card = getByTestId('test-card');
      expect(card).toBeTruthy();
    });
  });

  describe('Button', () => {
    it('renders title correctly', () => {
      const { getByText } = render(
        <Button title="Test Button" onPress={() => {}} />
      );
      
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <Button title="Test Button" onPress={mockOnPress} />
      );
      
      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('applies primary variant styles', () => {
      const { getByTestId } = render(
        <Button 
          title="Primary Button" 
          onPress={() => {}} 
          variant="primary"
          testID="primary-button"
        />
      );
      
      const button = getByTestId('primary-button');
      expect(button).toBeTruthy();
    });

    it('applies secondary variant styles', () => {
      const { getByTestId } = render(
        <Button 
          title="Secondary Button" 
          onPress={() => {}} 
          variant="secondary"
          testID="secondary-button"
        />
      );
      
      const button = getByTestId('secondary-button');
      expect(button).toBeTruthy();
    });

    it('handles disabled state correctly', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Button 
          title="Disabled Button" 
          onPress={mockOnPress} 
          disabled 
          testID="disabled-button"
        />
      );
      
      const button = getByTestId('disabled-button');
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('CustomTextInput', () => {
    it('renders with placeholder', () => {
      const { getByTestId } = render(
        <CustomTextInput 
          placeholder="Enter text" 
          value="" 
          onChangeText={() => {}} 
          testID="text-input"
        />
      );
      
      expect(getByTestId('text-input')).toBeTruthy();
    });

    it('calls onChangeText when text changes', () => {
      const mockOnChangeText = jest.fn();
      const { getByTestId } = render(
        <CustomTextInput 
          placeholder="Enter text" 
          value="" 
          onChangeText={mockOnChangeText} 
          testID="text-input"
        />
      );
      
      fireEvent.changeText(getByTestId('text-input'), 'New text');
      expect(mockOnChangeText).toHaveBeenCalledWith('New text');
    });

    it('displays current value', () => {
      const { getByTestId } = render(
        <CustomTextInput 
          placeholder="Enter text" 
          value="Current value" 
          onChangeText={() => {}} 
          testID="text-input"
        />
      );
      
      const input = getByTestId('text-input');
      expect(input.props.value).toBe('Current value');
    });

    it('renders with error message', () => {
      const { getByText, getByTestId } = render(
        <CustomTextInput 
          placeholder="Enter text" 
          value="" 
          onChangeText={() => {}} 
          error="Error message"
          testID="error-input"
        />
      );
      
      expect(getByTestId('error-input')).toBeTruthy();
      expect(getByText('Error message')).toBeTruthy();
    });
  });

  describe('SectionHeader', () => {
    it('renders title correctly', () => {
      const { getByText } = render(
        <SectionHeader title="Test Section" />
      );
      
      expect(getByText('Test Section')).toBeTruthy();
    });

    it('renders action button when provided', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <SectionHeader 
          title="Test Section" 
          action="Add"
          onActionPress={mockOnPress}
        />
      );
      
      expect(getByText('Add')).toBeTruthy();
      fireEvent.press(getByText('Add'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not render action button when not provided', () => {
      const { queryByText } = render(
        <SectionHeader title="Test Section" />
      );
      
      expect(queryByText('Add')).toBeNull();
    });
  });
});
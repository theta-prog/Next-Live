import { getTabIconName } from '../../navigation/AppNavigator';
jest.mock('@react-native-community/datetimepicker', () => ({ __esModule: true, default: 'DateTimePicker' }));
jest.mock('@react-native-picker/picker', () => ({ Picker: 'Picker' }));

describe('AppNavigator coverage - functions', () => {
  it('getTabIconName returns expected icons for all routes and focus states', () => {
    const cases: { route: string; focused: boolean; expected: string }[] = [
      { route: 'Home', focused: true, expected: 'home' },
      { route: 'Home', focused: false, expected: 'home-outline' },
      { route: 'Calendar', focused: true, expected: 'calendar' },
      { route: 'Calendar', focused: false, expected: 'calendar-outline' },
      { route: 'Memories', focused: true, expected: 'heart' },
      { route: 'Memories', focused: false, expected: 'heart-outline' },
      { route: 'Artists', focused: true, expected: 'people' },
      { route: 'Artists', focused: false, expected: 'people-outline' },
      { route: 'Unknown', focused: true, expected: 'help-outline' },
      { route: 'Unknown', focused: false, expected: 'help-outline' },
    ];

    cases.forEach(({ route, focused, expected }) => {
      expect(getTabIconName(route, focused)).toBe(expected as any);
    });
  });
});

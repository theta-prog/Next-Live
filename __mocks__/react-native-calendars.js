const React = require('react');

const createMockComponent = (name) => {
  const component = React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref, testID: props.testID || name });
  });
  component.displayName = name;
  return component;
};

module.exports = {
  Calendar: createMockComponent('Calendar'),
  CalendarList: createMockComponent('CalendarList'),
  Agenda: createMockComponent('Agenda'),
  LocaleConfig: {
    locales: {},
    defaultLocale: 'en'
  }
};

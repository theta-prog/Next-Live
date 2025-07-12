const React = require('react');

const createMockComponent = (name) => 
  React.forwardRef((props, ref) => {
    return React.createElement('View', { ...props, ref, testID: props.testID || name });
  });

module.exports = {
  Calendar: createMockComponent('Calendar'),
  CalendarList: createMockComponent('CalendarList'),
  Agenda: createMockComponent('Agenda'),
  LocaleConfig: {
    locales: {},
    defaultLocale: 'en'
  }
};

const React = require('react');

module.exports = {
  launchImageLibraryAsync: jest.fn(() => 
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }]
    })
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  MediaTypeOptions: {
    Images: 'Images'
  }
};

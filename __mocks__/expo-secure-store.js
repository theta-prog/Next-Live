const mockSecureStore = {
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
};

export default mockSecureStore;
export const setItemAsync = mockSecureStore.setItemAsync;
export const getItemAsync = mockSecureStore.getItemAsync;
export const deleteItemAsync = mockSecureStore.deleteItemAsync;
export const isAvailableAsync = mockSecureStore.isAvailableAsync;
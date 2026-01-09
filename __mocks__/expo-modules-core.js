// Mock expo-modules-core
export class EventEmitter {
  constructor() {}
  addListener() {}
  removeListener() {}
  emit() {}
  removeAllListeners() {}
}

export const NativeModule = class NativeModule {};

export default {
  EventEmitter,
  NativeModule,
};
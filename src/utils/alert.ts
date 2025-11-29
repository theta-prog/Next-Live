import { Alert, Platform } from 'react-native';

export const confirmDelete = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  if (Platform.OS === 'web') {
    // Web specific confirmation
    // setTimeout is used to ensure the UI has updated before the alert blocks the thread
    setTimeout(() => {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result) {
        onConfirm();
      } else {
        onCancel?.();
      }
    }, 100);
  } else {
    // Native Alert
    Alert.alert(
      title,
      message,
      [
        { text: 'キャンセル', style: 'cancel', onPress: onCancel },
        { 
          text: '削除', 
          style: 'destructive', 
          onPress: onConfirm 
        },
      ],
      { cancelable: true }
    );
  }
};

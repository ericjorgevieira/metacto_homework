import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  likeButton: {
    backgroundColor: '#e8f5e9',
  },
  dislikeButton: {
    backgroundColor: '#ffebee',
  },
  activeButton: {
    borderColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

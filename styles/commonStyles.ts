
import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#FCD34D',
  secondary: '#18181B',
  background: '#18181B',
  backgroundAlt: '#27272a',
  text: '#FFFFFF',
  textSecondary: '#71717a',
  card: '#27272a',
  border: '#FCD34D',
  zinc900: '#18181b',
  zinc800: '#27272a',
  zinc700: '#3f3f46',
};

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  glassCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 20,
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  glassButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    padding: 16,
    alignItems: 'center',
  },
});

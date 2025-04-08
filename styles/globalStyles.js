// styles/globalStyles.js
import { StyleSheet } from 'react-native';
import colors from './colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginVertical: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: colors.muted,
    paddingVertical: 8,
    marginBottom: 15,
    color: colors.text,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

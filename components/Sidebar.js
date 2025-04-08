// components/Sidebar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import colors from '../styles/colors';

export default function Sidebar({ active, setActive, onLogout }) {
  const NavButton = ({ label, target, style }) => (
    <TouchableOpacity
      style={[
        styles.navButton,
        active === target && styles.activeButton,
        style // Apply custom styles
      ]}
      onPress={() => setActive(target)}
    >
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <NavButton label="Schedule" target="schedule" />
      <NavButton label="Settings" target="settings" />

      <TouchableOpacity style={[styles.navButton, styles.logoutButton]} onPress={onLogout}>
        <Text style={[styles.navText, { color: '#fff' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
    backgroundColor: '#1f1e1d',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 40,
  },
  navButton: {
    width: 100,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
    marginBottom: 20,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: colors.highlight,
  },
  navText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    marginTop: 'auto',
  },
});

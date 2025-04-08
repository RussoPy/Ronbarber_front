// components/HeaderBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeaderBar({ username }) {
  return (
    <View style={styles.container}>
      {/* Optionally add logo here */}
      {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
      {username && <Text style={styles.username}>Welcome, {username}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 15,
  },
  username: {
    fontSize: 18,   // Adjusted to make the username a bit bigger for prominence
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

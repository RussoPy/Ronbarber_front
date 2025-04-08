// components/HeaderBar.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function HeaderBar({ username }) {
  return (
    <View style={styles.container}>
      {/* Optionally add logo here */}
      {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
      <Text style={styles.title}>Your Schedule</Text>
      {username && <Text style={styles.username}>Welcome, {username}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
  },
  username: {
    fontSize: 16,
    color: '#5B2C6F',
    marginTop: 4,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

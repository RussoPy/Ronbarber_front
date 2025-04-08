// components/LockNotice.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LockNotice({ onUnlock }) {
  return (
    <View style={styles.noticeBox}>
      <Text style={styles.text}>
        🔒 This day's list is locked because messages were already sent.
      </Text>
      <TouchableOpacity onPress={onUnlock} style={styles.button}>
        <Text style={styles.buttonText}>Unlock Editing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  noticeBox: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  text: {
    color: '#856404',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f39c12',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
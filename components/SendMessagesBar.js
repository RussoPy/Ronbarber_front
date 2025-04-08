// components/SendMessagesBar.js
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import StyledButton from './StyledButton';

export default function SendMessagesBar({ sentCount, totalMessages, onSend }) {
  const confirmSend = () => {
    Alert.alert(
      "Send Messages",
      `Send reminders to all clients (${totalMessages})?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send", onPress: onSend } // Ensure onSend is called here
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StyledButton title="Send Messages" onPress={confirmSend} color='#4da163'
        style={{ paddingVertical: 12, paddingHorizontal: 110, borderRadius: 25 }}  // Custom style for this button only
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  status: {
    marginBottom: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
});

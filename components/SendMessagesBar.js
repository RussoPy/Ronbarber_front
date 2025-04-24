import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StyledButton from './StyledButton';
import SystemMessageModal from './SystemMessageModal';

export default function SendMessagesBar({ sentCount, onSend }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={styles.container}>
      <StyledButton
        title="שלח הודעות"
        onPress={() => setShowConfirm(true)}
        color="#4da163"
        style={{ paddingVertical: 12, paddingHorizontal: 110, borderRadius: 25 }}
      />

<SystemMessageModal
  visible={showConfirm}
  title="שליחת הודעות"
  message="לשלוח את כל ההודעות ברשימה?"
  onCancel={() => setShowConfirm(false)}
  onConfirm={() => {
    setShowConfirm(false);
    onSend();
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
});

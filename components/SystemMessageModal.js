import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/SystemMessageStyles';

export default function SystemMessageModal({
  visible,
  title = '',
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'שלח',
  cancelLabel = 'ביטול',
  confirmColor = '#4da163',
  onlyConfirm = false, // ✅ NEW
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          {title !== '' && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.text}>{message}</Text>

          <View style={styles.buttons}>
            {!onlyConfirm && (
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.btn, { backgroundColor: '#ccc' }]}
              >
                <Text style={styles.btnText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.btn, { backgroundColor: confirmColor }]}
            >
              <Text style={styles.btnText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

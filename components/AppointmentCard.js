import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function AppointmentCard({ item, onEdit, onDelete, onSendSMS, onDuplicate, isDayLocked }) {
  const renderRightActions = () => (
    <View style={styles.swipeAction}>
      <Text style={styles.swipeText} onPress={() => onDuplicate(item)}>
        ➕ קביעת שבוע הבא
      </Text>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2.5} rightThreshold={40}>
      <View style={[styles.card, item.sent && styles.sentCard]}>
        <View style={styles.topRow}>
          <Text style={styles.cardText}>{item.name}</Text>
          <TouchableOpacity onPress={() => onEdit(item.id)} style={styles.timeButton}>
            <Text style={styles.timeButtonText}>{item.time}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardSub}>{item.phone}</Text>

        {!isDayLocked && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#b51628' }]} onPress={() => onDelete(item.id)}>
              <Text style={styles.buttonText}>מחיקה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#4da163' }]} onPress={() => onSendSMS(item.phone, item.name, item.time)}>
              <Text style={styles.buttonText}>שליחת SMS</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7E7CE',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  sentCard: {
    backgroundColor: '#D0F0C0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  cardSub: {
    color: '#95A5A6',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  swipeAction: {
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  timeButton: {
    backgroundColor: '#8b499c',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  timeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

// components/AppointmentCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function AppointmentCard({ item, onEdit, onDelete, onSendSMS, onDuplicate, isDayLocked }) {
  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.swipeAction}
          onPress={() => onDuplicate(item)}
        >
          <Text style={styles.swipeText}>➕ Next Week</Text>
        </TouchableOpacity>
      )}
    >
      <View style={[styles.card, item.sent && styles.sentCard]}>
        <View style={styles.topRow}>
          <Text style={styles.cardText}>{item.name}</Text>
          <Text style={styles.cardText}>{item.time}</Text>
        </View>
        <Text style={styles.cardSub}>{item.phone}</Text>

              {!isDayLocked && (
                  <View style={styles.actions}>
                      <ActionButton title="Edit" onPress={() => onEdit(item.id)} color="#8b499c" />
                      <ActionButton title="Delete" onPress={() => onDelete(item.id)} color="#8b499c" />
                      <ActionButton
                          title="Send SMS"
                          onPress={() => onSendSMS(item.phone, item.name, item.time)}
                          color="#8b499c"
                      />
                  </View>
        )}
      </View>
    </Swipeable>
  );
}

function ActionButton({ title, onPress, color }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: color }]}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
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
    justifyContent: 'space-between'
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50'
  },
  cardSub: {
    color: '#95A5A6',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  swipeAction: {
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

// components/DateSelector.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import StyledButton from './StyledButton'; // Reuse your custom button

export default function DateSelector({ selectedDate, setShowDatePicker, showDatePicker, onDateChange }) {
  const dateKey = selectedDate.toISOString().split('T')[0];

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Selected Day:</Text>
      <StyledButton title={dateKey} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={selectedDate}
          onChange={(e, selected) => {
            setShowDatePicker(false);
            if (selected) onDateChange(selected);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#5B2C6F',
  },
});

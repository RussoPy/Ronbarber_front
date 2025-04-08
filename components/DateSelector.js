// components/DateSelector.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import StyledButton from './StyledButton'; // Reuse your custom button

export default function DateSelector({ selectedDate, setShowDatePicker, showDatePicker, onDateChange }) {
  const dateKey = selectedDate.toISOString().split('T')[0];  // Get date string in 'YYYY-MM-DD' format

  return (
    <View style={styles.container}>
      {/* Date Button as a title button */}
      <StyledButton
        title={dateKey}  // Pass dateKey directly as a string
        onPress={() => setShowDatePicker(true)}
        color="#1f1e1d"
        style={styles.dateButton}  // Apply custom style for the button
      />
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
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#5B2C6F',
  },
  // New styles for the date button
  dateButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#808080',  // Button background color
    color: '#fff',               // White text color
  },
});

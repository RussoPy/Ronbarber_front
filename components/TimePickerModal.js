import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TimePickerModal({
  visible,
  appointmentTime,
  setAppointmentTime,
  onConfirm,
  onCancel,
  editingId,
  onEditConfirm
  
}) {
  if (!visible) return null;

  const handleChange = (event, selected) => {
    if (event.type === 'dismissed') {
      onCancel();
      return;
    }

    if (selected) {
      setAppointmentTime(selected);

      if (editingId) {
        onEditConfirm(editingId, selected);
      } else {
        onConfirm(selected); // Pass the real value directly
      }

      onCancel(); // Hide the picker after confirm
    }
  };

  return (
    <DateTimePicker
      mode="time"
      is24Hour={true}
      value={appointmentTime}
      onChange={handleChange}
      display="spinner"
    />
  );
}

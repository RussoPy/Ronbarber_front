// components/TimePickerModal.js
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

  const handleChange = (e, selected) => {
    if (selected) {
      setAppointmentTime(selected);
      if (editingId) {
        onEditConfirm(editingId, selected);
      } else {
        onConfirm();
      }
    }
    onCancel();
  };

  return (
    <DateTimePicker
      mode="time"
      is24Hour
      value={appointmentTime}
      onChange={handleChange}
    />
  );
}

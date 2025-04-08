// components/AppointmentList.js
import React from 'react';
import { FlatList } from 'react-native';
import AppointmentCard from './AppointmentCard';

export default function AppointmentList({
  appointments,
  isDayLocked,
  onEdit,
  onDelete,
  onSendSMS,
  onDuplicate
}) {
  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AppointmentCard
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onSendSMS={onSendSMS}
          onDuplicate={onDuplicate}
          isDayLocked={isDayLocked}
        />
      )}
    />
  );
}
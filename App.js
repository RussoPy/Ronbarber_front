// Original App.js (Restored + Better Card Layout Without Numbers)
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Alert, TouchableOpacity,
  TextInput, Platform, StyleSheet, Linking
} from 'react-native';
import * as Contacts from 'expo-contacts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { database } from './firebaseConfig';
import uuid from 'react-native-uuid';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const StyledButton = ({ title, onPress, color = '#5B2C6F' }) => (
  <TouchableOpacity onPress={onPress} style={[buttonStyles.button, { backgroundColor: color }]}> 
    <Text style={buttonStyles.text}>{title}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [contactToSchedule, setContactToSchedule] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [sentMessages, setSentMessages] = useState({});
  const [sentCount, setSentCount] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const dbRef = ref(database, `appointments/${dateKey}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      const sortedList = list.sort((a, b) => a.time.localeCompare(b.time));
      setAppointments(sortedList);
    });
    return () => unsubscribe();
  }, [selectedDate]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const triggerRef = ref(database, 'trigger/send_whatsapp');
  
    onValue(triggerRef, (snapshot) => {
      const data = snapshot.val();
  
      if (!data || data.date !== today) {
        set(triggerRef, {
          date: today,
          send_now: true
        });
      } else if (data.send_now === true) {
        // Reset it to false to avoid repeat sending
        set(triggerRef, {
          date: data.date,
          send_now: false
        });
      }
    }, { onlyOnce: true });
  }, []);
  

  const loadContacts = async () => {
    if (Platform.OS === 'web') {
      alert("Contact access not supported on web.");
      return;
    }

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission denied", "Enable contacts permission.");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const filtered = data.filter(c => c.phoneNumbers?.length > 0);
    setContacts(filtered);
    setShowContacts(true);
  };

  const handleContactPress = (contact) => {
    setContactToSchedule(contact);
    setShowTimePicker(true);
    setShowContacts(false);
  };

  const confirmTimeAndSave = () => {
    const id = uuid.v4();
    const cleanPhone = contactToSchedule.phoneNumbers[0].number.replace(/\s|-/g, '');
    const timeStr = appointmentTime.toTimeString().slice(0, 5);

    set(ref(database, `appointments/${dateKey}/${id}`), {
      name: contactToSchedule.name,
      phone: cleanPhone,
      time: timeStr
    });

    setShowTimePicker(false);
    setContactToSchedule(null);
    setAppointmentTime(new Date());
  };

  const editAppointmentTime = (id) => {
    setEditingAppointmentId(id);
    setShowTimePicker(true);
  };

  const deleteAppointment = (id) => {
    remove(ref(database, `appointments/${dateKey}/${id}`));
  };

  const duplicateNextWeek = (item) => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextDateKey = nextWeek.toISOString().split('T')[0];

    const newId = uuid.v4();

    set(ref(database, `appointments/${nextDateKey}/${newId}`), {
      name: item.name,
      phone: item.phone,
      time: item.time
    });

    Alert.alert("✅ Added", `Appointment copied to ${nextDateKey}`);
  };

  const sendWhatsAppReminders = () => {
    Alert.alert(
      "Send WhatsApp Messages",
      "Are you sure you want to send all reminders now?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes", onPress: async () => {
            try {
              let successful = 0;
              setSentCount(0);
              setTotalMessages(appointments.length);

              for (const appt of appointments) {
                const response = await fetch(`https://ronbarber.onrender.com/send_single`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(appt)
                });

                if (response.ok) {
                  successful++;
                  setSentCount(prev => prev + 1);
                }
              }

              setSentCount(successful);
              Alert.alert("✅ Done", `${successful} of ${appointments.length} reminders sent!`);
            } catch (error) {
              console.error("Error sending:", error);
              Alert.alert("❌ Error", "Could not send reminders.");
            }
          }
        }
      ]
    );
  };

  const openSMS = (phone, name, time) => {
    const formattedPhone = phone.startsWith('+') ? phone : '+972' + phone.replace(/^0+/, '');
    const message = `שלום ${name}, תזכורת לתור שלך היום בשעה ${time}. תודה, רון הספר 💈`;
    const url = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;

    Linking.openURL(url).then(() => {
      setSentMessages(prev => ({ ...prev, [phone]: true }));
    }).catch(err =>
      Alert.alert('Error', 'Could not open SMS app.')
    );
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>📅 Schedule</Text>

        <View style={styles.dateRow}>
          <Text style={styles.label}>Selected Day:</Text>
          <StyledButton title={dateKey} onPress={() => setShowDatePicker(true)} />
        </View>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={selectedDate}
            onChange={(e, selected) => {
              setShowDatePicker(false);
              if (selected) setSelectedDate(selected);
            }}
          />
        )}

        <View style={styles.searchRow}>
          <StyledButton
            title={showContacts ? "Hide Contacts" : "Load Contacts"}
            onPress={() => showContacts ? setShowContacts(false) : loadContacts()}
            color="#2ecc71"
          />
          <TextInput
            placeholder="Search contact"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>

        {showContacts && (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => handleContactPress(item)}>
                <Text style={styles.cardText}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.phoneNumbers[0].number}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            is24Hour
            value={appointmentTime}
            onChange={(e, selected) => {
              if (selected) {
                setAppointmentTime(selected);
                if (editingAppointmentId) {
                  update(ref(database, `appointments/${dateKey}/${editingAppointmentId}`), {
                    time: selected.toTimeString().slice(0, 5)
                  });
                  setEditingAppointmentId(null);
                } else {
                  confirmTimeAndSave();
                }
                setShowTimePicker(false);
              } else {
                setShowTimePicker(false);
              }
            }}
          />
        )}

        <Text style={styles.subHeader}>📋 Appointments ({appointments.length})</Text>
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#2ecc71',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 100,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                  onPress={() => duplicateNextWeek(item)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>➕ Next Week</Text>
                </TouchableOpacity>
              )}
            >
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardText}>{item.name}</Text>
                  <Text style={styles.cardText}>{item.time}</Text>
                </View>
                <Text style={styles.cardSub}>{item.phone}</Text>
                <View style={styles.actions}>
                  <StyledButton title="Edit" onPress={() => editAppointmentTime(item.id)} color="#3498db" />
                  <StyledButton title="Delete" onPress={() => deleteAppointment(item.id)} color="#E74C3C" />
                  <StyledButton title="Send SMS" onPress={() => openSMS(item.phone, item.name, item.time)} color="#2ecc71" />
                </View>
              </View>
            </Swipeable>
          )}
        />

        {totalMessages > 0 && (
          <View style={{ marginVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#2C3E50', fontWeight: 'bold' }}>
              {sentCount} / {totalMessages} messages sent...
            </Text>
            <View style={{
              width: '100%',
              height: 10,
              backgroundColor: '#ddd',
              borderRadius: 5,
              marginTop: 5,
              overflow: 'hidden'
            }}>
              <View style={{
                width: `${(sentCount / totalMessages) * 100}%`,
                height: '100%',
                backgroundColor: '#5B2C6F'
              }} />
            </View>
          </View>
        )}

        <View style={{ marginTop: 30 }}>
          <StyledButton title="Send Messages" onPress={sendWhatsAppReminders} color="#5B2C6F" />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#FAF0E6' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#2C3E50', marginBottom: 25, marginTop: 25 },
  subHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#2C3E50', marginBottom: 10 },
  label: { fontSize: 16, color: '#5B2C6F' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 10, borderBottomWidth: 2, borderColor: '#95A5A6', color: '#2C3E50' },
  list: { marginTop: 10 },
  card: { backgroundColor: '#F7E7CE', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 3 },
  cardText: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  cardSub: { color: '#95A5A6', fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }
});

const buttonStyles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  text: { color: '#fff', fontWeight: 'bold' }
});

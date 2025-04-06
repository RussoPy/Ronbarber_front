// BarberApp.js - Modified to normalize phone numbers before saving
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

// ✅ Normalize Israeli phone numbers to E.164 format
const normalizePhone = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9+]/g, ""); // Remove all non-digits and keep +
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) return "+972" + cleaned.slice(1);
  return "+972" + cleaned; // Fallback
};

export default function BarberApp({ user, username }) {
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
  const [isDayLocked, setIsDayLocked] = useState(false);


  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const dbRef = ref(database, `appointments/${user.uid}/${dateKey}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      const sortedList = list.sort((a, b) => a.time.localeCompare(b.time));
      setAppointments(sortedList);

      const alreadySent = Object.values(data).some(appt => appt.sent);
      setIsDayLocked(alreadySent);
    });
    return () => unsubscribe();
  }, [selectedDate, user.uid]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const triggerRef = ref(database, `trigger/${user.uid}/send_whatsapp`);
    onValue(triggerRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || data.date !== today) {
        set(triggerRef, { date: today, send_now: true });
      } else if (data.send_now === true) {
        set(triggerRef, { date: data.date, send_now: false });
      }
    }, { onlyOnce: true });
  }, [user.uid]);

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
    const rawPhone = contactToSchedule.phoneNumbers[0].number;
    const cleanPhone = normalizePhone(rawPhone);
    const timeStr = appointmentTime.toTimeString().slice(0, 5);
    set(ref(database, `appointments/${user.uid}/${dateKey}/${id}`), {
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
    remove(ref(database, `appointments/${user.uid}/${dateKey}/${id}`));
  };

  const duplicateNextWeek = (item) => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextDateKey = nextWeek.toISOString().split('T')[0];
    const newId = uuid.v4();
    set(ref(database, `appointments/${user.uid}/${nextDateKey}/${newId}`), {
      name: item.name,
      phone: item.phone,
      time: item.time
    });
    Alert.alert("✅ Added", `Appointment copied to ${nextDateKey}`);
  };

  const sendWhatsAppReminders = () => {
    Alert.alert(
      "Send Messages",
      `Send reminders for ${dateKey}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            if (isDayLocked) {
              Alert.alert(
                "⚠️ Are you sure?",
                "Messages were already sent for this day. Sending again will resend SMS to the same people.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Send Anyway",
                    onPress: async () => {
                      await actuallySendMessages();
                    },
                    style: "destructive"
                  }
                ]
              );
            } else {
              await actuallySendMessages();
            }
          }
        }
      ]
    );
  };
  
  const actuallySendMessages = async () => {
    try {
      const response = await fetch("https://barber-back-ng32.onrender.com/send_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, date: dateKey }),
      });
  
      const result = await response.json();
      if (response.ok) {
        setSentCount(result.sent || 0);
        setTotalMessages(result.total || 0);
        Alert.alert("✅ Done", result.message);
      } else {
        Alert.alert("❌ Error", result.error || "Failed to send.");
      }
    } catch (error) {
      Alert.alert("❌ Error", "Could not connect to server.");
    }
  };
  

  const openSMS = (phone, name, time) => {
    const formattedPhone = phone.startsWith('+') ? phone : '+972' + phone.replace(/^0+/, '');
    const message = `שלום ${name}, תזכורת לתור שלך היום בשעה ${time}. תודה, רון הספר 💈`;
    const url = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).then(() => {
      setSentMessages(prev => ({ ...prev, [phone]: true }));
    }).catch(err => Alert.alert('Error', 'Could not open SMS app.'));
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}> Your Schedule</Text>

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
                  update(ref(database, `appointments/${user.uid}/${dateKey}/${editingAppointmentId}`), {
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
        {isDayLocked && (
          <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#fff3cd', borderRadius: 8 }}>
            <Text style={{ color: '#856404' }}>
              🔒 This day's list is locked because messages were already sent.
            </Text>
            <StyledButton
              title="Unlock Editing"
              onPress={() => setIsDayLocked(false)}
              color="#f39c12"
            />
          </View>
        )}
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
              <View style={[styles.card, item.sent && { backgroundColor: '#D0F0C0' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.cardText}>{item.name}</Text>
                  <Text style={styles.cardText}>{item.time}</Text>
                </View>
                <Text style={styles.cardSub}>{item.phone}</Text>

                {!isDayLocked && (
                  <View style={styles.actions}>
                    <StyledButton title="Edit" onPress={() => editAppointmentTime(item.id)} color="#3498db" />
                    <StyledButton title="Delete" onPress={() => deleteAppointment(item.id)} color="#E74C3C" />
                    <StyledButton title="Send SMS" onPress={() => openSMS(item.phone, item.name, item.time)} color="#2ecc71" />
                  </View>
                )}
              </View>  {/* ✅ This must close the card no matter what */}


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
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'left', color: '#2C3E50', marginBottom: 25, marginTop: 25 },
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

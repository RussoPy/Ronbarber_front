// BarberApp.js
import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, FlatList, Text } from 'react-native';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import uuid from 'react-native-uuid';
import SystemMessageModal from './components/SystemMessageModal';

import { database } from './firebaseConfig';
import * as Contacts from 'expo-contacts';

import HeaderBar from './components/HeaderBar';
import DateSelector from './components/DateSelector';
import ContactSearch from './components/ContactSearch';
import AppointmentList from './components/AppointmentList';
import TimePickerModal from './components/TimePickerModal';
import LockNotice from './components/LockNotice';
import { Linking } from 'react-native';
import SendMessagesBar from './components/SendMessagesBar';
import StyledButton from './components/StyledButton'; // already built in original


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
  const [messageTemplate, setMessageTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmAction, setModalConfirmAction] = useState(() => () => { });
  const [modalProps, setModalProps] = useState({});



  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const normalizePhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/[^0-9+]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("0")) return "+972" + cleaned.slice(1);
    return "+972" + cleaned;
  };

  const showConfirmModal = ({
    title,
    message,
    onConfirm,
    confirmLabel = 'שלח',
    cancelLabel = 'ביטול',
    confirmColor = '#4da163',
    onlyConfirm = false
  }) => {
    setModalTitle(title || '');
    setModalMessage(message);
    setModalConfirmAction(() => () => {
      setModalVisible(false);
      onConfirm();
    });
    setModalProps({ confirmLabel, cancelLabel, confirmColor, onlyConfirm });
    setModalVisible(true);
  };
  
  useEffect(() => {
    const infoRef = ref(database, `users/${user.uid}/info`);
    onValue(infoRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.name) {
        showConfirmModal({
          title: "👋 ברוך הבא",
          message: `שלום ${data.name}`,
          confirmLabel: "המשך",
          confirmColor: "#4da163",
          onlyConfirm: true,
          onConfirm: () => {},
        });
      }

      if (data?.template) {
        setMessageTemplate(data.template);
      }
    }, { onlyOnce: true });
  }, []);

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
  }, [selectedDate]);

  const handleLoadContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      showConfirmModal({
        title: "אין הרשאה",
        message: "נא לאשר גישה לאנשי קשר בהגדרות המכשיר",
        onConfirm: () => { },
      }); return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });
    const filtered = data.filter(c => c.phoneNumbers?.length > 0);
    setContacts(filtered);
    setShowContacts(true);
  };

  const handleContactSelect = (contact) => {
    console.log("📞 Selected contact:", contact.name);
    setContactToSchedule(contact);
    setShowTimePicker(true);
    setShowContacts(false);
  };

  const confirmTimeAndSave = (selectedTime) => {
    try {
      const rawPhone = contactToSchedule?.phoneNumbers?.[0]?.number;
      if (!rawPhone) {
        showConfirmModal({
          title: "❌ איש קשר לא תקין",
          message: "לאיש קשר זה אין מספר טלפון",
          onConfirm: () => { },
        }); return;
      }

      const cleanPhone = normalizePhone(rawPhone);
      if (!cleanPhone) {
        Alert.alert("⚠️ Invalid Phone", "שגיאה בהוספת איש קשר");
        return;
      }

      const id = uuid.v4();
      const timeStr = selectedTime.toTimeString().slice(0, 5); // Use selectedTime instead of appointmentTime

      set(ref(database, `appointments/${user.uid}/${dateKey}/${id}`), {
        name: contactToSchedule.name,
        phone: cleanPhone,
        time: timeStr,
      });

      setContactToSchedule(null);
      setAppointmentTime(new Date()); // Reset for next use
    } catch (err) {
      Alert.alert("Error", "שגיאה בהוספת תור");
      console.error("confirmTimeAndSave error:", err);
    }
  };



  const editAppointmentTime = (id) => {
    setEditingAppointmentId(id);
    setShowTimePicker(true);
  };

  const updateAppointmentTime = (time) => {
    update(ref(database, `appointments/${user.uid}/${dateKey}/${editingAppointmentId}`), {
      time: time.toTimeString().slice(0, 5)
    });
    setEditingAppointmentId(null);
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
    showConfirmModal({
      title: "שליחת הודעות",
      message: `אתה בטוח שאתה רוצה לשלוח הודעות לתאריך ${dateKey}?`,
      confirmLabel: "המשך",
      cancelLabel: "ביטול",
      confirmColor: "#4da163",
      onConfirm: () => {
        if (isDayLocked) {
          showConfirmModal({
            title: "⚠️ הודעות כבר נשלחו",
            message: "האם לשלוח שוב לכולם?",
            confirmLabel: "המשך",
            cancelLabel: "ביטול",
            confirmColor: "#4da163",
            onConfirm: actuallySendMessages
          });
        } else {
          actuallySendMessages();
        }
      }
    });
  };
  

  const actuallySendMessages = async () => {
    setIsSending(true); // ✅ Show overlay
    try {
      const response = await fetch("https://barber-back-ng32.onrender.com/send_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          date: dateKey,
          template: messageTemplate
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setSentCount(result.sent || 0);
        setTotalMessages(result.total || 0);
        Alert.alert("✅ בוצע", result.message);
      } else {
        Alert.alert("❌ שגיאה", result.error || "שליחה נכשלה.");
      }
    } catch (error) {
      Alert.alert("❌ שגיאה", "לא ניתן להתחבר לשרת.");
    } finally {
      setIsSending(false); // ✅ Hide overlay no matter what
    }
  };
  const openSMS = (phone, name, time) => {
    if (!phone || typeof phone !== 'string') {
      Alert.alert("⚠️ מספר לא תקין", "לאיש קשר אין מספר תקין");
      return;
    }

    const formattedPhone = phone.startsWith('+')
      ? phone
      : '+972' + phone.replace(/^0+/, '');

    const message = (messageTemplate || `שלום {{name}}, תזכורת לתור שלך היום בשעה {{time}}. תודה, {{barber}} 💈`)
      .replace('{{name}}', name)
      .replace('{{time}}', time)
      .replace('{{barber}}', username || 'הספר');

    const url = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .then(() => {
        setSentMessages(prev => ({ ...prev, [phone]: true }));
      })
      .catch(err => {
        Alert.alert('❌ שגיאה', 'לא ניתן לפתוח את אפליקציית ההודעות.');
        console.error('SMS open failed:', err);
      });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <HeaderBar username={username} />

      <DateSelector
        selectedDate={selectedDate}
        setShowDatePicker={setShowDatePicker}
        showDatePicker={showDatePicker}
        onDateChange={setSelectedDate}
      />

      <ContactSearch
        contacts={contacts}
        showContacts={showContacts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        loadContacts={handleLoadContacts}
        onSelectContact={handleContactSelect}
        onHide={() => setShowContacts(false)}
      />

      <TimePickerModal
        visible={showTimePicker}
        appointmentTime={appointmentTime}
        setAppointmentTime={setAppointmentTime}
        onCancel={() => setShowTimePicker(false)}
        editingId={editingAppointmentId}
        onEditConfirm={(id, time) => {
          updateAppointmentTime(time);
          setShowTimePicker(false);
        }}
        onConfirm={(selectedTime) => {
          confirmTimeAndSave(selectedTime);
          setShowTimePicker(false);
        }}
      />

      <Text style={styles.subHeader}>📋 תורים ({appointments.length})</Text>

      {isDayLocked && (
        <LockNotice onUnlock={() => setIsDayLocked(false)} />
      )}

      <AppointmentList
        appointments={appointments}
        onEdit={editAppointmentTime}
        onDelete={deleteAppointment}
        onDuplicate={duplicateNextWeek}
        onSendSMS={openSMS}
        isDayLocked={isDayLocked}
        sentMessages={sentMessages}
      />

      <SendMessagesBar
        sentCount={sentCount}
        totalMessages={totalMessages}
        onSend={sendWhatsAppReminders}
      />
      {isSending && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>הודעות נשלחות, נא להמתין...</Text>
          </View>
        </View>
      )}
      <SystemMessageModal
  visible={modalVisible}
  title={modalTitle}
  message={modalMessage}
  onCancel={() => setModalVisible(false)}
  onConfirm={modalConfirmAction}
  confirmLabel={modalProps.confirmLabel}
  cancelLabel={modalProps.cancelLabel}
  confirmColor={modalProps.confirmColor}
  onlyConfirm={modalProps.onlyConfirm}

/>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: { padding: 20, flex: 1, backgroundColor: '#FAF0E6' },
  subHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#2C3E50', marginBottom: 10 },
});

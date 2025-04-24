import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebaseConfig';
import StyledButton from './StyledButton';

export default function Settings({ user }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!user) return;

    const infoRef = ref(database, `users/${user.uid}/info`);
    get(infoRef).then(snapshot => {
      const data = snapshot.val();
      if (data) {
        if (data.name) setName(data.name);
        if (data.template) setTemplate(data.template);
      }
    });
  }, [user]);

  const saveSettings = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    set(ref(database, `users/${user.uid}/info`), {
      name,
      template: template.trim() || `שלום {{name}}, תזכורת לתור שלך היום בשעה {{time}}. תודה, ${name} 💈`
    })
      .then(() => Alert.alert("✅ נשמר בהצלחה", "ההגדרות שלך נשמרו!"))
      .catch(() => Alert.alert("❌ שגיאה", "משהו השתבש"));
  };

  useEffect(() => {
    const sample = (template || '')
      .replace('{{name}}', 'דוד')
      .replace('{{time}}', '14:30')
      .replace('{{barber}}', name || 'הספר');

    setPreview(sample);
  }, [template, name]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>שלום {name || '...'} 👋</Text>
      <Text style={styles.header}>הגדרות</Text>

      <Text style={styles.label}>השם שלך</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. רון הספר"
        style={styles.input}
      />

      <Text style={styles.label}>תוכן ההודעה:</Text>
      <TextInput
        value={template}
        onChangeText={(text) => {
          if (text.length <= 160) setTemplate(text);
        }}
        placeholder="e.g. שלום {{name}}, תזכורת לתור שלך היום בשעה {{time}}... תודה, {{barber}} 💈"
        style={[styles.input, { height: 80 }]}
        multiline
        maxLength={160}
      />

      <Text style={{ color: '#5B2C6F', textAlign: 'right' }}>
        {template.length}/160 תווים
      </Text>

      <StyledButton title="שמור הגדרות" onPress={saveSettings} />

      <Text style={styles.label}>:</Text>
      <View style={styles.previewBox}>
        <Text style={styles.previewText}>{preview}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#FAF0E6', },
  greeting: {
    fontSize: 18,
    textAlign: 'center',
    color: '#34495E',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#5B2C6F',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#2C3E50',
  },
  previewBox: {
    backgroundColor: '#F7E7CE',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    minHeight: 200,
    justifyContent: 'flex-start', // ✅ top-align content
  },
  previewText: {
    color: '#2C3E50',
    fontSize: 15,
    lineHeight: 22,            // ✅ better spacing
    flexShrink: 1,             // ✅ prevents overflow
    flexWrap: 'wrap',          // ✅ wrap long lines
  },
});

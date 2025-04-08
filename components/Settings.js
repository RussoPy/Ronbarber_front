// components/Settings.js
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
    .then(() => Alert.alert("✅ Saved", "Your settings have been updated!"))
    .catch(() => Alert.alert("❌ Error", "Something went wrong"));
  };

  useEffect(() => {
    const sample = (template || '').replace('{{name}}', 'דוד').replace('{{time}}', '14:30');
    setPreview(sample);
  }, [template]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <Text style={styles.label}>Your Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. רון הספר"
        style={styles.input}
      />

      <Text style={styles.label}>Message Template</Text>
      <TextInput
        value={template}
        onChangeText={setTemplate}
        placeholder="e.g. שלום {{name}}, תזכורת לתור שלך היום בשעה {{time}}..."
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <StyledButton title="Save Settings" onPress={saveSettings} />

      <Text style={styles.label}>Preview</Text>
      <View style={styles.previewBox}>
        <Text style={styles.previewText}>{preview}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, color: '#5B2C6F' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: '#2C3E50'
  },
  previewBox: {
    backgroundColor: '#F7E7CE',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  previewText: {
    color: '#2C3E50',
    fontSize: 15
  }
});

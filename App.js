// App.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth, database } from './firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import MainApp from './MainApp';

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (isRegistering && phone !== confirmPhone) {
      Alert.alert("Error", "Phone numbers do not match.");
      return;
    }
  
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, `users/${userCredential.user.uid}/info`), {
          email,
          phone
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      Alert.alert("Auth Error", err.message);
    }
  };

  if (initializing) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!user) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={styles.title}>Login</Text>
  
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
  
        {isRegistering && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phone number (e.g., 0541234567)"
              onChangeText={setPhone}
              value={phone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm phone number"
              onChangeText={setConfirmPhone}
              value={confirmPhone}
              keyboardType="phone-pad"
            />
          </>
        )}
  
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isRegistering ? "Register" : "Login"}</Text>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switch}>
            {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>
      </GestureHandlerRootView>
    );
  }

  return <MainApp user={user} logout={() => signOut(auth)} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FAF0E6' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2C3E50' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8, borderColor: '#ccc' },
  button: { backgroundColor: '#5B2C6F', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  switch: { marginTop: 12, textAlign: 'center', color: '#5B2C6F' }
});
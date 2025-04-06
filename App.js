// App.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Alert, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from './firebaseConfig';
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
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const validatePhone = (number) => {
    const regex = /^05\d{8}$/;
    return regex.test(number);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters.");
        return;
      }

      if (!validatePhone(phone)) {
        Alert.alert("Error", "Phone number must be Israeli format like 0541234567.");
        return;
      }

      if (phone !== confirmPhone) {
        Alert.alert("Error", "Phone numbers do not match.");
        return;
      }

      if (!name) {
        Alert.alert("Error", "Name is required.");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, `users/${userCredential.user.uid}/info`), {
          name,
          email,
          phone
        });
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          Alert.alert("Error", "This email is already in use.");
        } else {
          Alert.alert("Auth Error", err.message);
        }
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        Alert.alert("Login Error", err.message);
      }
    }
  };

  if (initializing) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!user) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={styles.title}>{isRegistering ? "Register" : "Login"}</Text>

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
              placeholder="Full Name"
              onChangeText={setName}
              value={name}
            />

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

        {/* ✅ Remember Me Custom Checkbox */}
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
          <Text style={styles.checkboxLabel}>Remember Me</Text>
        </TouchableOpacity>

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
  switch: { marginTop: 12, textAlign: 'center', color: '#5B2C6F' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  checkbox: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderColor: '#5B2C6F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#5B2C6F',
  },
  checkboxLabel: { color: '#2C3E50' },
});

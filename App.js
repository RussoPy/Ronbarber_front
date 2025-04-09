import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      Alert.alert("שגיאה", "חובה למלא אימייל וסיסמה.");
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        Alert.alert("שגיאה", "הסיסמה חייבת להכיל לפחות 6 תווים.");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("שגיאה", "הסיסמאות לא תואמות.");
        return;
      }

      if (!validatePhone(phone)) {
        Alert.alert("שגיאה", "מספר הטלפון חייב להיות בפורמט ישראלי (למשל 0541234567).");
        return;
      }

      if (phone !== confirmPhone) {
        Alert.alert("שגיאה", "מספרי הטלפון אינם תואמים.");
        return;
      }

      if (!name) {
        Alert.alert("שגיאה", "נא למלא את השם.");
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
          Alert.alert("שגיאה", "כתובת האימייל הזו כבר בשימוש.");
        } else {
          Alert.alert("שגיאה", err.message);
        }
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        Alert.alert("שגיאת התחברות", err.message);
      }
    }
  };

  if (initializing) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!user) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <Text style={styles.appName}>FadeTime 💈</Text>
        <Text style={styles.title}>{isRegistering ? "הרשמה" : "התחברות"}</Text>

        <TextInput
          style={styles.input}
          placeholder="אימייל"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="סיסמה"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {isRegistering && (
          <>
            <TextInput
              style={styles.input}
              placeholder="אימות סיסמה"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry={!showPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="שם מלא"
              onChangeText={setName}
              value={name}
            />

            <TextInput
              style={styles.input}
              placeholder="מספר טלפון (למשל 0541234567)"
              onChangeText={setPhone}
              value={phone}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="אימות מספר טלפון"
              onChangeText={setConfirmPhone}
              value={confirmPhone}
              keyboardType="phone-pad"
            />
          </>
        )}

        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
          <Text style={styles.checkboxLabel}>זכור אותי</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isRegistering ? "צור חשבון" : "התחבר"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switch}>
            {isRegistering ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הרשם"}
          </Text>
        </TouchableOpacity>
      </GestureHandlerRootView>
    );
  }

  return <MainApp user={user} logout={() => signOut(auth)} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FAF0E6' },
  appName: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#5B2C6F' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2C3E50' },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 8, borderColor: '#ccc', color: '#2C3E50' },
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingRight: 8,
  },
  eye: {
    fontSize: 18,
    paddingHorizontal: 8,
    color: '#5B2C6F',
  },
});

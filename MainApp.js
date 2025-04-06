// MainApp.js (Per-user data enabled)
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { database } from './firebaseConfig';
import BarberApp from './BarberApp';

const auth = getAuth();

export default function MainApp() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
  
      if (user) {
        const nameRef = ref(database, `users/${user.uid}/name`);
        onValue(nameRef, (snapshot) => {
          const name = snapshot.val();
          if (name) setUsername(name);
        });
  
        // ✅ Auto-logout if user is deleted from Firebase DB
        const infoRef = ref(database, `users/${user.uid}/info`);
        onValue(infoRef, (snapshot) => {
          if (!snapshot.exists()) {
            Alert.alert("🚫 Account Removed", "Your account was deleted.");
            auth.signOut();
          }
        });
      }
  
      if (initializing) setInitializing(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5B2C6F" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Not logged in</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <BarberApp user={user} username={username} />
      <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { fontSize: 18, color: '#2C3E50' },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

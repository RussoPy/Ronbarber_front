// MainApp.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Pressable,
  Text,
} from 'react-native';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { database } from './firebaseConfig';

import BarberApp from './BarberApp';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import StyledButton from './components/StyledButton';

const auth = getAuth();

export default function MainApp() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('schedule');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;

  // Handle slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? 0 : -150,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [sidebarOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        const nameRef = ref(database, `users/${user.uid}/name`);
        onValue(nameRef, (snapshot) => {
          const name = snapshot.val();
          if (name) setUsername(name);
        });

        const infoRef = ref(database, `users/${user.uid}/info`);
        onValue(infoRef, (snapshot) => {
          if (!snapshot.exists()) {
            alert("Your account was deleted.");
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
    <TouchableWithoutFeedback onPress={() => sidebarOpen && setSidebarOpen(false)}>
      <View style={styles.root}>
        {/* Sidebar (animated) */}
        <Animated.View style={[styles.sidebarContainer, { left: slideAnim }]}>
          <Sidebar
            active={activeTab}
            setActive={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
            onLogout={() => signOut(auth)}
          />
        </Animated.View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Sidebar toggle button */}
          <View style={styles.toggleBtn}>
            <StyledButton title="☰" onPress={() => setSidebarOpen(true)} color="#1f1e1d" />
          </View>

          {activeTab === 'schedule' && <BarberApp user={user} username={username} />}
          {activeTab === 'settings' && <Settings user={user} />}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { fontSize: 18, color: '#2C3E50' },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 150,
    backgroundColor: '#5B2C6F',
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingLeft: 0,
    paddingTop:0,
    zIndex: 1,
    position: 'relative',  // Ensure positioning context for absolute positioning
  },
  toggleBtn: {
    position: 'absolute', // Free positioning
    top: 40,              // 20px from the top of the container (adjust as needed)
    left: 20,             // 20px from the left of the container (adjust as needed)
    zIndex: 3,            // Ensure the button is above other content
  }
});

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBH_p93NrW2ntd8sRIYjtOiSgvzskEhLM4",
  authDomain: "barberreminder.firebaseapp.com",
  databaseURL: "https://barberreminder-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "barberreminder",
  storageBucket: "barberreminder.firebasestorage.app",
  messagingSenderId: "118453251420",
  appId: "1:118453251420:web:9130e6c36fd276751e2599"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };

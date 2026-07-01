import { initializeApp, getApps } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCsIu-LDgCtcKF2ZrIhrKFp8MB00zTvf4Q',
  authDomain: 'gala-6a890.firebaseapp.com',
  projectId: 'gala-6a890',
  storageBucket: 'gala-6a890.firebasestorage.app',
  messagingSenderId: '64554543965',
  appId: '1:64554543965:web:fbd295a9e830209e1d96b4',
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

void setPersistence(auth, browserLocalPersistence);

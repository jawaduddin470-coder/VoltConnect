import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyCAzSbzrxt-kA7YSWLg-qaaT8v8dix_NKE",
    authDomain: "voltconnect-30c9b.firebaseapp.com",
    projectId: "voltconnect-30c9b",
    storageBucket: "voltconnect-30c9b.firebasestorage.app",
    messagingSenderId: "519731202341",
    appId: "1:519731202341:web:b8df28c1231eed64c7b2cc",
    measurementId: "G-D6TJ7N9W3V"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;

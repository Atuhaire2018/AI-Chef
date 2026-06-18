import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
// Set OAuth scopes for Google Tasks
googleAuthProvider.addScope('https://www.googleapis.com/auth/tasks');
googleAuthProvider.addScope('https://www.googleapis.com/auth/tasks.readonly');

export default app;

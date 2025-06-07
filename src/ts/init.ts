import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.ts';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);









export { app, db };
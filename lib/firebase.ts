// firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1v5q4Tdjyi1HvYe9hJmQXPzDGgfCDyLg",
  authDomain: "eewqwsd.firebaseapp.com",
  databaseURL: "https://eewqwsd-default-rtdb.firebaseio.com",
  projectId: "eewqwsd",
  storageBucket: "eewqwsd.firebasestorage.app",
  messagingSenderId: "571347711427",
  appId: "1:571347711427:web:8c7db5ca50c2f851ad3976",
  measurementId: "G-1HVHX0CMHW",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

let _auth: Auth | null = null;
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(app);
  }
  return _auth;
}

export { app, db, database };

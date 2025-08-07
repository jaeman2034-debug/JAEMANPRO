import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 설정 (테스트용 더미 값)
const firebaseConfig = {
  apiKey: "test_api_key",
  authDomain: "test.firebaseapp.com",
  projectId: "test_project",
  storageBucket: "test.appspot.com",
  messagingSenderId: "123456789",
  appId: "test_app_id"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app }; 
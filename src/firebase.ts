// Firebase 설정을 임시로 비활성화
// import { initializeApp, getApps } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// Firebase 설정 (임시 더미 값으로 작동)
// const firebaseConfig = {
//   apiKey: "dummy_api_key_for_testing",
//   authDomain: "dummy.firebaseapp.com",
//   projectId: "dummy_project",
//   storageBucket: "dummy.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "dummy_app_id"
// };

// const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export { app };

// 임시 더미 객체들
export const auth = null;
export const db = null;
export const app = null; 
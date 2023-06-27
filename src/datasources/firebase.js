import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCYx67Ob7AurTlGjqltJtHly55VI9CpRhc",
    authDomain: "project1-6b61d.firebaseapp.com",
    databaseURL: "https://project1-6b61d-default-rtdb.firebaseio.com",
    projectId: "project1-6b61d",
    storageBucket: "project1-6b61d.appspot.com",
    messagingSenderId: "443117889351",
    appId: "1:443117889351:web:bf68d0cde1f9d2b5e78e62"
  };
const useFirebase = initializeApp(firebaseConfig);
const useDatabase = getDatabase(useFirebase),
  useAuth = getAuth(useFirebase);

export {useDatabase, useAuth}
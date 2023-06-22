import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const useDatabase = firebase.initializeApp({
    databaseURL: "https://project1-6b61d-default-rtdb.firebaseio.com/"
}).database();

// database 분류 //
const useMyInfo = useDatabase.ref("myInfo") // 내 계정정보 //
const useCategory = useDatabase.ref("category") // 피드 정보 //

export {useMyInfo, useCategory}
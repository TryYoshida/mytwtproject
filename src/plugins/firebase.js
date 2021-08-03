import firebase from 'firebase'

// import firebase from 'firebase/app'
// import 'firebase/auth'
// import 'firebase/database'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAt4vIprJLMSqsyPhguwGMSqoj1d6H0w1Y",
  authDomain: "mytwtproject.firebaseapp.com",
  databaseURL: "https://mytwtproject-default-rtdb.firebaseio.com",
  projectId: "mytwtproject",
  storageBucket: "mytwtproject.appspot.com",
  messagingSenderId: "666089031436",
  appId: "1:666089031436:web:9d6af5a02611783f8ceb29",
  measurementId: "G-3DH73E073J"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export default firebase

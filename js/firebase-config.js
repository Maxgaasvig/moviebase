"use strict";

// ========== GLOBAL FIREBASE CONFIG ========== //
// Your web app's Firebase configuration
const _firebaseConfig = {
  apiKey: "AIzaSyCNkrsxtSHqvYA_4g28GqGrkBGT1PUdOtc",
  authDomain: "eksamensmovies.firebaseapp.com",
  projectId: "eksamensmovies",
  storageBucket: "eksamensmovies.appspot.com",
  messagingSenderId: "269522479789",
  appId: "1:269522479789:web:246b3e9cfb408aca063424"
};
// Initialize Firebase
firebase.initializeApp(_firebaseConfig);
const _db = firebase.firestore();

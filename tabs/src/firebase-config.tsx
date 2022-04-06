import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, getDownloadURL, getStream, ref, uploadBytesResumable } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBI7j3abGfZ14L1IaplmqQc5ieg8Y4TRZY",
    authDomain: "cloudhr-a43c1.firebaseapp.com",
    projectId: "cloudhr-a43c1",
    storageBucket: "cloudhr-a43c1.appspot.com",
    messagingSenderId: "104228162635",
    appId: "1:104228162635:web:533c610a727928142411ce",
    measurementId: "G-NR41MGTMXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export {
    getStorage, getDownloadURL, getStream, ref, uploadBytesResumable,
    db
}
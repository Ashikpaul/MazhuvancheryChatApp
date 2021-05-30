import { useState, useRef } from "react";
import "./styles.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAnnJD-bYeyOwMhcmFaSjQvg_8u36t85A4",
    authDomain: "ashik-chat-app.firebaseapp.com",
    projectId: "ashik-chat-app",
    storageBucket: "ashik-chat-app.appspot.com",
    messagingSenderId: "1059981754441",
    appId: "1:1059981754441:web:83890617bc69a25e20ff98",
    measurementId: "G-J5V63PTJV0"
  });
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth
      .signInWithPopup(provider)
      .then(function (result) {
        // code which runs on success
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        console.log(errorCode);
        alert(errorCode);

        var errorMessage = error.message;
        console.log(errorMessage);
        alert(errorMessage);
      });
  };

  return (
    <button onClick={() => signInWithGoogle()}>Sign in with Google</button>
  );
}

const SignOut = () => {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

const ChatRoom = () => {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const dummy = useRef();

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
};

const ChatMessage = (props) => {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      {messageClass === "received" ? (
        <div className={`message ${messageClass}`}>
          <img src={photoURL} alt="" />
          <span> {text}</span>
        </div>
      ) : (
        <div className={`message ${messageClass}`}>
          <span> {text}</span>
          <img src={photoURL} alt="" />
        </div>
      )}
    </>
  );
};

export default function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>Mazhuvanchery Chat App</header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

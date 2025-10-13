import React, { useState } from "react";
import "./AddUser.css";
import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const AddUser = () => {
  const [user, setUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      console.log(newChatRef.id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="adduser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="username" name="username" />
        <button>Search</button>
      </form>
      <div className="user">
        <div className="detail">
          <img src="./avatar.png" alt="" />
          <span>Jane Doe</span>
        </div>
        <button onClick={handleAdd}>Add User</button>
      </div>
    </div>
  );
};

export default AddUser;
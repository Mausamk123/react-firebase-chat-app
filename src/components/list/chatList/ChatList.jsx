import React, { useState } from 'react';
import "./chatList.css";
import AddUser from './addUser/AddUser';
import {useUserStore} from "../../../lib/userStore";
import {useEffect} from "react";
import {onSnapshot,doc,getDoc} from "firebase/firestore";
import { db } from '../../../lib/firebase';
const ChatList = () => {
  const [chats,setChats]=useState([]);
    const [addMode, setAddMode] = useState(false);

    const {currentUser}=useUserStore();
    useEffect(() => {
   const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
    // res.data() is assumed to contain a property named 'chats' which is an array of chat items
    const items = res.data().chats;

    // Create an array of promises, each resolving to a chat item with the user data attached
    const promises = items.map(async (item) => {
      // Get a reference to the user's document using the receiverId
      const userDocRef = doc(db, "users", item.receiverId);

      // Fetch the user's document data
      const userDocSnap = await getDoc(userDocRef);

      // Extract the user data
      const user = userDocSnap.data();

      // Return a new object that merges the original chat item and the user data
      return { ...item, user };
    });

    // Wait for all promises (user data fetches) to complete
    const chatData = await Promise.all(promises);
    setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));

    // The rest of the logic to set the state with chatData would go here
    // e.g., setChats(chatData);
  });
    return () => {
      unSub();
    };
  }, [currentUser.id]);
  console.log(chats);

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" />
        </div>
        <img
        src={addMode ? "./minus.png" : "./plus.png"}
        alt=""
        className="add-icon"
        onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {chats.map((chat) => (
        <div className="item" key={chat.id}>
          <img src={chat.user.avatar} alt="" />
          <div className="texts">
            <span>J.D</span> 
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

       
        
        {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
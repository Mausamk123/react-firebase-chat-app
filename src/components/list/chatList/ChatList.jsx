import React, { useState } from 'react';
import "./chatList.css";
import AddUser from './addUser/AddUser';
import {useUserStore} from "../../../lib/userStore";
import {useEffect} from "react";
import {useChatStore} from "../../../lib/chatStore";
import {onSnapshot,doc,getDoc, updateDoc} from "firebase/firestore";
import { db } from '../../../lib/firebase';
const ChatList = () => {
  const [chats,setChats]=useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");
    const {currentUser}=useUserStore();
    const {chatId,changeChat}=useChatStore();
    console.log(chatId);
    useEffect(() => {
  const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
   console.log('userchats snapshot', res && res.exists ? res.data() : null);
   // guard: if the doc is missing or doesn't have chats, treat as empty array
   const items = (res && res.exists && Array.isArray(res.data().chats)) ? res.data().chats : [];

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

  const handleSelect=async (chat)=>{
    console.log("handleSelect selected:", chat);
    // optimistic local update: clear unread UI immediately so the item turns transparent
    setChats((prev) =>
      prev.map((c) =>
        c.chatId === chat.chatId ? { ...c, isSeen: true, updatedAt: Date.now() } : c
      )
    );
    // persist the seen state for the current user
    try {
      await markAsSeen(chat);
    } catch (err) {
      console.error("markAsSeen error", err);
    }
    changeChat(chat.chatId, chat.user);
  }
  //console.log(chats);

  const handleAdd=async ()=>{
    const userchatref=doc(db,"userchats",currentUser.id);
    const userchatsnapshot=await getDoc(userchatref);
    
  }

  // mark a chat as seen for the current user (updates userchats/{currentUser.id})
  const markAsSeen = async (chat) => {
    if (!chat || !chat.chatId) return;
    const userchatref = doc(db, "userchats", currentUser.id);
    const snap = await getDoc(userchatref);
    if (!snap.exists()) return;
    const data = snap.data();
    const chatsArr = Array.isArray(data.chats) ? data.chats : [];
    const idx = chatsArr.findIndex((c) => c.chatId === chat.chatId);
    if (idx !== -1) {
      if (chatsArr[idx].isSeen) return; // already seen
      chatsArr[idx].isSeen = true;
      chatsArr[idx].updatedAt = Date.now();
      await updateDoc(userchatref, { chats: chatsArr });
    }
  };
  // helper: normalize string for search (NFKD, remove diacritics, collapse spaces, lowercase)
  const normalizeForSearch = (s) =>
    (s || "")
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase();

  const query = normalizeForSearch(input);
  const filteredchats = query
    ? chats.filter((c) => {
        const rawName = c?.user?.username || c?.user?.displayName || "";
        const uname = normalizeForSearch(rawName);
        return uname.includes(query);
      })
    : chats;

  // debug: if user typed a query and no chats matched, print the normalized names once
  if (query && filteredchats.length === 0) {
    console.debug("search: no matches for query", query, "available:", chats.map((c) => ({ id: c.chatId || c.id, name: normalizeForSearch(c?.user?.username || c?.user?.displayName || "") })));
  }

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div> 
        <img
        src={addMode ? "./minus.png" : "./plus.png"}
        alt=""
        className="add-icon"
        onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredchats.map((chat) => (
        <div
          className={`item ${chat.isSeen ? "" : "unread"}`}
          key={chat.chatId ?? chat.id}
          onClick={() => handleSelect(chat)}
        >
          <img
            src={chat.user?.blocked?.includes(currentUser.id) ? "./avatar.png" : chat.user?.avatar || "./avatar.png"}
            alt=""
          />
          <div className="texts">
            <span>{chat.user?.blocked?.includes(currentUser.id) ? "User" : chat.user?.username || chat.user?.displayName || "User"}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

       
        
        {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
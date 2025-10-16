import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";


const Chat = () => {
  const [chat,setChat]=useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const {chatId,user,isCurrentUserBlocked, isReceiverBlocked} =useChatStore();
  const { currentUser } = useUserStore();

  
  useEffect(() => {
  if (!chatId) {
    console.log("Chat.jsx: no chatId, skipping onSnapshot");
    setChat(null);
    return;
  }

  console.log("Chat.jsx: starting onSnapshot for chatId:", chatId);
  const unSub = onSnapshot(
    doc(db, "chats", chatId),
    (res) => {
      console.log("Chat.jsx: snapshot received for", chatId, res && res.exists ? res.data() : null);
      setChat(res.data());
    },
    (err) => {
      console.error("Chat.jsx: onSnapshot error for", chatId, err);
    }
  );

  return () => {
    console.log("Chat.jsx: unsubscribing from chatId:", chatId);
    unSub();
  };
}, [chatId]);

console.log("Chat component mounted. local destructured:", { chatId, user });
console.log("Chat store snapshot:", useChatStore.getState());

  console.log(chat);

  const messagesEndRef = useRef(null);

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (!chat || !chat.messages) return;
    // small timeout to allow DOM to render
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [chat && chat.messages && chat.messages.length]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    try {
      // append message to chat document
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          text,
          senderId: currentUser?.id || null,
          createdAt: Date.now(),
        }),
      });

      // helper to update userchats entry for a uid
      const updateUserChats = async (uid, seen) => {
        const userchatref = doc(db, "userchats", uid);
        const snap = await getDoc(userchatref);
        if (!snap.exists()) return;
        const data = snap.data();
        const chatsArr = Array.isArray(data.chats) ? data.chats : [];
        const idx = chatsArr.findIndex((c) => c.chatId === chatId);
        if (idx !== -1) {
          chatsArr[idx].lastMessage = text;
          chatsArr[idx].isSeen = seen;
          chatsArr[idx].updatedAt = Date.now();
        } else {
          chatsArr.push({
            chatId,
            lastMessage: text,
            receiverId: uid === currentUser.id ? user.id : currentUser.id,
            isSeen: seen,
            updatedAt: Date.now(),
          });
        }
        await updateDoc(userchatref, { chats: chatsArr });
      };

      // update current user (seen=true) and receiver (seen=false)
      if (currentUser && currentUser.id) await updateUserChats(currentUser.id, true);
      if (user && user.id) await updateUserChats(user.id, false);
    } catch (err) {
      console.log("handleSend error", err);
    }

    setText("");
  };

  //console.log(text);

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" className="avatar"/>
          <div className="texts">
            <span>{user?.username || "User"}</span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat && Array.isArray(chat.messages) && chat.messages.length > 0 ? (
          chat.messages.map((m, idx) => {
            const isOwn = m.senderId && currentUser && currentUser.id && m.senderId === currentUser.id;
            const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "";
            return (
              <div className={`message ${isOwn ? "own" : ""}`} key={m.createdAt ? `${m.createdAt}-${idx}` : idx}>
                <img src={isOwn ? "./avatar.png" : "./avatar.png"} alt="" />
                <div className="texts">
                  <p>{m.text}</p>
                  <span>{time}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-messages">No messages yet. Say hi 👋</div>
        )}

        {/* sentinel for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "CANNOT WRITE MESSAGE" : "Type a message..."}
        value={text} onChange={(e) => setText(e.target.value)}
        disabled={isCurrentUserBlocked || isReceiverBlocked}
         />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen(!open)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );

};

export default Chat;
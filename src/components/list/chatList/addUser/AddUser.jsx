import React, { useState } from "react";
import "./AddUser.css";
import { db } from "../../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  writeBatch,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const {currentUser}=useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = (formData.get("username") || "").trim();

    try {
      // normalize helper for robust matching
      const normalizeForSearch = (s) => (s || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().trim();

      console.debug("AddUser.handleSearch input:", { username, normalized: normalizeForSearch(username) });
      const userRef = collection(db, "users");

      // try exact match first (fast if usernames are stored as-is)
      const q = query(userRef, where("username", "==", username));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // include document id so we can reference the user later
        const docSnap = querySnapshot.docs[0];
        setUser({ id: docSnap.id, ...docSnap.data() });
      } else {
        // fallback: case-insensitive client-side search (for small demos)
        // note: for production, add a `usernameLower` field in Firestore and index it
        const allUsersSnap = await getDocs(userRef);
        const lower = normalizeForSearch(username);
        const all = allUsersSnap.docs.map((d) => ({ id: d.id, username: d.data().username || d.data().displayName || "" }));
        console.debug("AddUser: available users:", all.map(a => ({ id: a.id, normalized: normalizeForSearch(a.username), raw: a.username })));
        const found = allUsersSnap.docs.find((d) => normalizeForSearch(d.data().username || d.data().displayName || "") === lower);
        if (found) {
          console.debug("AddUser: fallback found user", found.id);
          setUser({ id: found.id, ...found.data() });
        } else {
          console.debug("AddUser: no user matched fallback for", lower);
          setUser(null);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    // guard: need a selected user and current user
    if (!user) return console.log("No user selected to add");
    if (!currentUser || !currentUser.id) return console.log("Current user not available");

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      console.log('handleAdd start', { currentUser, user });
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      console.log('chat created', newChatRef.id);

      // Use a batch so both userchats docs are written atomically
      const batch = writeBatch(db);

      batch.set(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // prepare chat entry for both users
      const entryForCurrent = {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      };

      const entryForSelected = {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      };

      batch.set(doc(userChatsRef, currentUser.id), entryForCurrent, { merge: true });
      batch.set(doc(userChatsRef, user.id), entryForSelected, { merge: true });

      await batch.commit();

      // verify writes
      const curSnap = await getDoc(doc(userChatsRef, currentUser.id));
      console.log('current userchats after batch', curSnap.exists() ? curSnap.data() : null);

      const selSnap = await getDoc(doc(userChatsRef, user.id));
      console.log('selected userchats after batch', selSnap.exists() ? selSnap.data() : null);

      // clear selection after successful add
      setUser(null);
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
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <span>{user?.username || user?.displayName || "No user selected"}</span>
        </div>
        <button onClick={handleAdd} disabled={!user}>Add User</button>
      </div>
    </div>
  );
};

export default AddUser;
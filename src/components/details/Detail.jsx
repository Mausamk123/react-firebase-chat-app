import "./detail.css";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayUnion, arrayRemove, updateDoc, doc } from "firebase/firestore";
const sharedPhotos = [
  {
    src: "https://images.pexels.com/photos/7381200/pexels-photo-7381200.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load",
    name: "photo_2024_2.png"
  },
  {
    src: "https://images.pexels.com/photos/7381200/pexels-photo-7381200.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load",
    name: "photo_2024_2.png"
  }
];

// Note: hooks must be called inside the component function below

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user || !currentUser) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className='detail'>
      <div className='user'>
        <img src='./avatar.png' alt='' />
        <h2>{user?.username || "User"}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className='info'>
        
        <div className='option'>
          <div className='title'>Chat Settings</div>
        </div>
        <div className='option'>
          <div className='title'>Privacy & help</div>
        </div>
        <div className='option'>
          <div className='title'>Shared Photos</div>
          <div className='photos'>
            {sharedPhotos.map((photo, idx) => (
              <div className='photoItem' key={idx}>
                <img src={photo.src} alt='' className='photoThumb' />
                <span>{photo.name}</span>
                <img src='./download.png' alt='' className='icon' />
              </div>
            ))}
          </div>
        </div>
        <div className='option'>
          <div className='title'>Shared Files</div>
        </div>
      </div>
      <div className='actions'>
        <button className='blockBtn' onClick={() => handleBlock()}>
          {isCurrentUserBlocked
            ? "You are blocked"
            : isReceiverBlocked
            ? "User is Blocked"
            : "Block User"}
        </button>
        <button className='logoutBtn' onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;

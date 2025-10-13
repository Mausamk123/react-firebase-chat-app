import "./detail.css";
import {auth} from "../../lib/firebase";
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

const Detail = () => {
  return (
    <div className='detail'>
      <div className='user'>
        <img src='./avatar.png' alt='' />
        <h2>Jane Doe</h2>
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
        <button className='blockBtn'>Block User</button>
        <button className='logoutBtn' onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
};

export default Detail;

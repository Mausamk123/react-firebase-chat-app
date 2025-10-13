import "./login.css"
import { useState } from "react";
import {toast} from "react-toastify";
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth";
import { auth,db } from "../../lib/firebase";
import {doc,setDoc} from "firebase/firestore";




const Login=()=>{
    
        const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  })

  const [loading,setloading]=useState(false);


   const handleRegister = async(e) => {
        e.preventDefault(); //
        setloading(true);
        const formData=new FormData(e.target);
        const {username,email,password}=Object.fromEntries(formData);
        try{
          const res=await createUserWithEmailAndPassword(auth,email,password);

          await setDoc(doc(db,"users",res.user.uid),{
            username,
            email,
            id:res.user.uid,
            blocked:[],
          });

          await setDoc(doc(db,"userchats",res.user.uid),{
            chats:[],
          });
          toast.success("Registration successful");
          console.log(res);

        }
        catch(err)
        {
          console.error(err);
          toast.error("Registration failed");

        }
        finally{
          setloading(false);
        }
        
    };

  const handleAvatar = e => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleLogin = async (e) => {
        e.preventDefault();
        const formData=new FormData(e.target);
        const {email,password}=Object.fromEntries(formData);

        setloading(true);
        // This is an example of an error notification using react-toastify
        try{

           
          await signInWithEmailAndPassword(auth,email,password);
          toast.success("Login successful");


        }
        catch(err)
        {
          console.error(err);
          toast.error(err.message);
        }
        finally{
          setloading(false);
        }
    };
  return <div className="login">
        <div className="item">
            <h2>Welcome Back</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Email" name="email"/>
                <input type="password" placeholder="Password" name="password"/>
                <button disabled={loading}>{loading?"Loading...":"Sign-in"}</button>

            </form>
        </div>
       <div className="separator"></div>
        <div className="item">
            <h2>Create an Account</h2>
            <form onSubmit={handleRegister}>
                <label htmlFor="file">
                <img src={avatar.url || "./avatar.png"} alt="" />
                Upload an image
                </label>
                <input 
                type="file" 
                id="file" 
                style={{display:"none"}} 
                onChange={handleAvatar}
                />
                <input type="text" placeholder="Username" name="username" />
                <input type="text" placeholder="Email" name="email" />
                <input type="password" placeholder="Password" name="password" />
                <button disabled={loading}>{loading?"Loading...":"Sign Up"}</button>
            </form>
        </div>
    </div>
}
export default Login;
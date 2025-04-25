import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DevScribbleLogo from '../components/logo';

const HomePage = () => {
    const roomIdRef = React.useRef();
    const navigate = useNavigate();
    const createNewRoom = () => {
        const roomId = uuidv4();
        roomIdRef.current.value = roomId;
        toast.success("New room created!");        
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const roomId = (formData.get('roomId') || '').trim();
        const username = (formData.get('username') || '').trim();
        if(!roomId)
            return toast.error("Room ID is required!");
        if(roomId.length < 6)
            return toast.error("Room ID should be atleast 6 characters long!");
        if(!username)
            return toast.error("Username is required!");
        if(username.length < 6)
            return toast.error("Username should be atleast 6 characters long!");
        navigate(`/editor/${roomId}`, {state: { username }});
        // e.target.reset();
    }

  return (
    <div className='homePageWrapper'>
        <form className='formWrapper' onSubmit={handleSubmit}>
            <DevScribbleLogo />
            <h4 className='mainLabel'>Paste invitation Room ID</h4>
            <div className='inputGroup'>
                <input ref={roomIdRef} type='text' placeholder='Room ID' className='inputField' name='roomId' required minLength={6}/>
                <input type='text' placeholder='Username' className='inputField' name='username' required minLength={6}/>
                <button className='joinBtn'>Join</button>
                <span className='createInfo'>If you don't have an invite then create a&nbsp; 
                    <button type='button' className='createNewBtn' onClick={createNewRoom}> new room</button>
                </span>
            </div>
        </form>
        <footer className='appFooter'>Built with ❤️ by <a href='https://github.com/pankajk787' target='_blank' rel='noreferrer'>Pankaj</a></footer>
    </div>
  )
}

export default HomePage

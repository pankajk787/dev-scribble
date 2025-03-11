import React from 'react'
import Editor from '../components/editor';
import { useOutletContext } from 'react-router-dom';

const EditorPage = () => {
  const { socketRef, roomId, codeRef } = useOutletContext();
  // const fetchSelf = async () => {
  //   try {
  //     const res = await fetch(`http://localhost:5000/get-self?socket_id=${socketRef.current.id}&room_id=${roomId}`);
  //     const data = await res.json();
  //     console.log("DATA::::::::::", data);
  //   } catch(e) {
  //     console.log("Failed to fetch self", e)
  //   }
  // }
  // useEffect(() => {
  //   if(socketRef.current && roomId) {
  //     fetchSelf();
  //   }
  // }, [socketRef.current, roomId]);

  return (
    <div>
      <Editor socketRef={socketRef} roomId={roomId} onCodeChange={({code, language}) => {
        codeRef.current = { code, language };
      }} />
    </div>
  )
}

export default EditorPage;

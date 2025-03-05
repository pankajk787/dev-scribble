import React from 'react'
import Editor from '../components/editor';
import { useOutletContext } from 'react-router-dom';

const EditorPage = () => {
  const { socketRef, roomId, codeRef } = useOutletContext();

  return (
    <div>
      <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
        codeRef.current = code;
      }} />
    </div>
  )
}

export default EditorPage;

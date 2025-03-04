import React from 'react'
import Editor from '../components/editor';
import { useOutletContext } from 'react-router-dom';

const EditorPage = () => {
  const { socketRef, roomId } = useOutletContext();

  return (
    <div>
      <Editor socketRef={socketRef} roomId={roomId} />
    </div>
  )
}

export default EditorPage;

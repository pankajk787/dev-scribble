import React, { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ACTIONS from '../constants/actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const isProgrammaticUpdateRef = useRef(false);

  const handleEditorDidMount = (editor, monaco)=> {
    editorRef.current = editor;
    editorRef.current.setValue("console.log('Hello world!')"); // Todo Remove later
    editor.onDidChangeModelContent((event) => {
      if(isProgrammaticUpdateRef.current) return;

      const code = editor.getValue();
      if(socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code
        })
      }
      onCodeChange(code);
    });
  } 

  useEffect(() => {
    if(socketRef.current) {
      const handleCodeChange = ({ code }) => {
        if(editorRef.current && code != null) {
          isProgrammaticUpdateRef.current = true;
          editorRef.current.setValue(code);
          isProgrammaticUpdateRef.current = false;
        }
      }

      // Listen to ACTIONS.CODE_CHANGE
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if(socketRef.current)
          socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      }
    }
  }, [socketRef.current]);
  return (
    <MonacoEditor
      height="100vh"
      language="javascript"
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        lineNumbers: "on",
      }}
    />
  )
}

export default Editor

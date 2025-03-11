import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ACTIONS from '../constants/actions';
import { SUPPORTED_LANGUAGES } from './constants';
import CanvasFreeDraw from '../containers/canavas-free-draw';
import useSelfDetailsStore from '../store/self-details-slice';
import './style.css';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isProgrammaticUpdateRef = useRef(false);
  const languageRef = useRef(SUPPORTED_LANGUAGES[0].value); // As 
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const selfDetails = useSelfDetailsStore((state) => state.selfDetails);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    languageRef.current = newLanguage;
    setSelectedLanguage(newLanguage);

    if(editorRef.current) {
      isProgrammaticUpdateRef.current = true;
      editorRef.current.setValue(""); // Clear the editor content
      isProgrammaticUpdateRef.current = false;
    }
  };

  const handleEditorDidMount = (editor, monaco)=> {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.focus();
    editor.onDidChangeModelContent((event) => {
      if(isProgrammaticUpdateRef.current) return;

      const code = editor.getValue();
      if(socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code, 
          language: languageRef.current
        })
      }
      onCodeChange({code, language: languageRef.current});
    });
  }

  const handleCodeSync = async (code) => {
    if(editorRef.current && code != null) {
      await new Promise((resolve) => { // Waiting for the editor to be ready
        setTimeout(() => {
          resolve();
        }, 10);
      });

      isProgrammaticUpdateRef.current = true;
      editorRef.current.setValue(code);
      isProgrammaticUpdateRef.current = false;
    }
  }

  useEffect(() => {
    const handleCodeChange = ({ code, language, isCodeSync }) => {
      if(language && language !== languageRef.current) {
        languageRef.current = language;
        setSelectedLanguage(language);
      }
      if(isCodeSync) {
          handleCodeSync(code);
      }
      else {
        if(editorRef.current && code != null) {
          isProgrammaticUpdateRef.current = true;
          editorRef.current.setValue(code);
          isProgrammaticUpdateRef.current = false;
        }
      }
    }
    if(socketRef.current) {
      // Listen to ACTIONS.CODE_CHANGE
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if(socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      }
    }
  }, [socketRef.current, editorRef.current]);

  return (
    <div>
      <div className='editor-header'>
        <div></div>
        <div>
          <CanvasFreeDraw socketRef={socketRef} roomId={roomId} />
        </div>
        <div>
          <select 
            disabled={!selfDetails?.isCreator}
            value={selectedLanguage} name='language' id='language' className='editor-language-select'
            onChange={handleLanguageChange}
            style={{ cursor: selfDetails?.isCreator ? "pointer" : "not-allowed" }}
          >
            {SUPPORTED_LANGUAGES.map(({ name, value }) => (
              <option key={value} 
                className={ `editor-language-select-option ${value === selectedLanguage ? "selected" : "" }`} 
                value={value}
              >
                  {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <MonacoEditor
        height="95vh"
        // language="javascript"
        language={selectedLanguage}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          lineNumbers: "on",
        }}
      />
    </div>
  )
}

export default Editor

import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ACTIONS from '../constants/actions';
import { SUPPORTED_LANGUAGES } from './constants';
import './style.css';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isProgrammaticUpdateRef = useRef(false);
  const languageRef = useRef(SUPPORTED_LANGUAGES[0].value); // As 
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].value);

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

  useEffect(() => {
    if(socketRef.current) {
      const handleCodeChange = ({ code, language }) => {
        if(language && language !== languageRef.current) {
          languageRef.current = language;
          setSelectedLanguage(language);
        }
        isProgrammaticUpdateRef.current = true;
        editorRef.current?.setValue(code);
        isProgrammaticUpdateRef.current = false;

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
        if(socketRef.current) {
          socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        }
      }
    }
  }, [socketRef.current, editorRef.current]);

  return (
    <div>
      <div className='editor-header'>
        <div></div>
        <div>
          <select 
            value={selectedLanguage} name='language' id='language' className='editor-language-select'
            onChange={handleLanguageChange}
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
        height="100vh"
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

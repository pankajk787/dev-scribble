import React, { useEffect, useRef } from "react";
import { Outlet, useParams, useLocation, useNavigate, Navigate } from "react-router-dom";
import CodeSyncLogo from "../assets/code-sync-logo.png";
import ClientsList from "../containers/clients-list";
import { initSocket } from "../socket";
import ACTIONS from "../constants/actions";
import toast from "react-hot-toast";
import { SUPPORTED_LANGUAGES } from "../components/constants";

const EditorLayout = () => {
  const navigate = useNavigate();
  const roomId = useParams().roomId;
  const location = useLocation();
  const username = location.state?.username;
  
    const [clients, setClients] = React.useState([]);
    const socketRef = useRef(null);
    const codeRef = useRef(null);

    const copyRoomId = async () => {
      try {
        await navigator.clipboard.writeText(roomId);
        toast.success("Copied to your clipboard!");
      } catch (e) {
        toast.error("Copy failed! Please try again.");
        console.error("Copy failed!", e);
      }
    }

    const leaveRoom = async () => {
      socketRef.current.disconnect();
      navigate("/", { replace: true});
    };

    useEffect(() => {
      (async function init() {
        try {
          socketRef.current = await initSocket();

          function handleError(error) {
            console.error("Socket error:", error);
            toast.error("Connection Failed! Please try again.");
            navigate("/", { replace: true});
          }

          socketRef.current.on('connect_error', handleError);
          socketRef.current.on('connect_failed', handleError);

          socketRef.current.emit(ACTIONS.JOIN, {
            roomId, username
          })

          socketRef.current.on(ACTIONS.JOINED, async (data) => {
            const { clients, username: joinedUserName, socketId } = data;
            if(joinedUserName !== username) {
              toast.success(`${joinedUserName} joined the room!`);
            }

            setClients(clients);
            
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second- after that sync code so that other users editor is initialized
            if(codeRef.current?.code) {
              socketRef.current.emit(ACTIONS.SYNC_CODE, { // Sync the code to just joined user
                socketId,
                code: codeRef.current?.code || "",
                language: codeRef.current?.language || SUPPORTED_LANGUAGES[0].value
              })
            }
          })

          socketRef.current.on(ACTIONS.DISCONNECTED, (data) => {
            const { username: disconnectedUserName, socketId } = data;
            if(disconnectedUserName !== username) {
              toast.success(`${disconnectedUserName} left the room!`);
            }
            setClients(prev => prev.filter(client => client.socketId !== socketId));
          })
        }
        catch (e) {
          console.error("WS-ERROR - Something Went wrong while WS connecting");
        }
      })();


      return () => {
        // Cleanups
        if(socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
          socketRef.current.off('connect_error');
          socketRef.current.off('connect_failed');
          socketRef.current = null;
        }
      }
    // eslint-disable-next-line
    }, []);

    if(!roomId || !username) {
      return <Navigate to="/" replace />
    }
  return (
    <div className="appLayoutWrapper">
      <aside className="leftPanelWrapper">
        <div className="logoWrapper dashedBorderBottom">
          <img src={CodeSyncLogo} alt="code-sync-logo" className="logoImage" />
          <div className="logoTextWrapper">
            <div className="logoText">Code Sync</div>
            <div className="logoTagLine">Realtime collaboration</div>
          </div>
        </div>
        <ClientsList clients={clients} />
        <div className="btnGroupWrapper">
            <button className="copyBtn" onClick={copyRoomId}>📋 Copy Room Id</button>
            <button className="leaveBtn" onClick={leaveRoom}>← Leave Room</button>
        </div>
      </aside>
      <main className="rightPanelWrapper">
        <Outlet context={{ socketRef, roomId, codeRef }}/>
      </main>
    </div>
  );
};

export default EditorLayout;

import { useEffect, useRef, useState } from "react";
import ACTIONS from "../../constants/actions";
import ChatWindow from "./ChatWindow";
import "./style.css";
import { useLocation } from "react-router-dom";

const ChatIcon = ({ socketRef, roomId }) => {
    const location = useLocation();
    const { username } = location.state;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const messageInputRef = useRef(null);
    const increaseMessageCount = () => {
        setIsOpen((val) => {
            if (!val) {
                setNewMessagesCount((prevCount) => prevCount + 1);
            }
            return val;
        });
    };

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.RECIEVED_MESSAGE, (data) => {
                data.recievedTime = Date.now();
                setMessages((prevMessages) => [...prevMessages, data]);
                increaseMessageCount();
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.RECIEVED_MESSAGE);
            }
        };
    }, [socketRef.current]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setNewMessagesCount(0);
    };

    const handleSend = (e) => {
        if (messageInputRef.current) {
            const message = messageInputRef.current.value.trim();
            if (message !== "") {
                const messageData = {
                    messageId: "msg-" + Date.now(),
                    text: message,
                    username,
                    sentTime: Date.now(),
                    recievedTime: null,
                    senderSocketId: socketRef.current.id,
                    roomId,
                };
                socketRef.current.emit(ACTIONS.SEND_MESSAGE, messageData);
                setMessages([...messages, messageData]);
                messageInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="chat-container">
            {/* Floating Chat Icon */}
            <div
                className="chat-icon"
                onClick={toggleChat}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>

                {newMessagesCount > 0 && (
                    <span className="chat-notification-badge">
                        {newMessagesCount >= 10 ? "9+" : newMessagesCount}
                    </span>
                )}
            </div>

            {
                isOpen &&
                <div className={`chat-window-wrapper`}>
                    <ChatWindow
                        onClose={toggleChat}
                        messages={messages}
                        socketRef={socketRef}
                        messageInputRef={messageInputRef}
                        handleSend={handleSend}
                    />
                </div>
            }
        </div>
    );
};

export default ChatIcon;

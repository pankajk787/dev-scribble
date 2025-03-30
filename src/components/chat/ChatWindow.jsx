import { format } from "date-fns";
import { useEffect, useRef } from "react";
import "./style.css";

const ChatWindow = ({
    onClose,
    messages,
    socketRef,
    messageInputRef,
    handleSend,
}) => {
    const userColorRef = useRef(new Map());
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const getUserBGColor = (socketId) => {
        if (!userColorRef.current.has(socketId)) {
            const randomColor = `hsl(${Math.floor(Math.random() * 360)}, ${
                Math.floor(Math.random() * 30) + 70
            }%, 30%)`;
            userColorRef.current.set(socketId, randomColor);
        }
        return userColorRef.current.get(socketId);
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <span>Chat</span>
                <button
                    title="Close chat"
                    type="button"
                    aria-label="Close chat"
                    onClick={onClose}
                    className="chat-close-btn">
                    ✕
                </button>
            </div>

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.messageId}
                        className={`message-container ${
                            msg.senderSocketId === socketRef.current.id
                                ? "user"
                                : "other"
                        }`}>

                        <div
                            title={msg.username}
                            className="user-avatar"
                            style={{
                                backgroundColor: getUserBGColor(
                                    msg.senderSocketId
                                ),
                            }}>
                            {msg.username.charAt(0)}
                        </div>

                        <div
                            className={`message-box ${
                                msg.senderSocketId === socketRef.current.id
                                    ? "user"
                                    : "other"
                            }`}>
                            <span>{msg.text}</span>
                            <span className="message-time">
                                {format(
                                    new Date(
                                        msg.senderSocketId ===
                                        socketRef.current.id
                                            ? msg.sentTime
                                            : msg.recievedTime
                                    ),
                                    "hh:mm a"
                                )}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                {messages.length === 0 && (
                    <div className="no-messages">No messages yet.</div>
                )}
            </div>

            <div className="chat-input-container">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}>
                    <textarea
                        rows={2}
                        placeholder="Type a message..."
                        className="chat-input"
                        ref={messageInputRef}
                    />
                    <button
                        type="submit"
                        aria-label="Send message"
                        className="chat-send-btn">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;

const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    SELF_JOINED: 'self-joined',
    DISCONNECTED: 'disconnected',
    LEAVE: 'leave',
    CODE_CHANGE: 'code-change',
    SYNC_CODE: 'sync-code',
    SYNC_CANVAS_CONTENT: 'sync-canvas-content',
    CANVAS_CHANGE: 'canvas-update',
    SEND_MESSAGE: "send-message",
    RECIEVED_MESSAGE: 'recieved_message',
    VOICE_CHAT_INITIATE: "voice-chat-initiate",
    ICE_CANDIDATE: "ice-candidate",
    OFFER: "offer",
    ANSWER: "answer",
}

module.exports = ACTIONS;
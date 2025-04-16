import React from "react";
import {
    getAvatarName,
    getAvatarShort,
    getRandomColor,
} from "../../utils/misc";
import "./style.css";
import MicIcon from "../../assets/icons/MicIcon";

const Client = ({
    client,
    index,
    currentUserSocketId,
    provideRef,
    toggleMute,
    isMuted,
}) => {
    const isLocalUser = currentUserSocketId === client.socketId;
    return (
        <div
            className="connectedUserWrapper"
            onClick={() => {
                if (isLocalUser) {
                    toggleMute(client.socketId);
                }
            }}>
            <span
                className="connectedUserAvatar"
                style={{ backgroundColor: getRandomColor(index) }}>
                {getAvatarShort(client.username)}
            </span>
            {isLocalUser && (
                <button
                    className={`muteToggleBtn ${
                        isMuted() ? "muted" : "unmuted"
                    }`}
                    style={{ color: "white" }}
                    aria-label={isMuted() ? "Unmute" : "Mute"}
                    title={isMuted() ? "Unmute" : "Mute"}>
                    <span className="sr-only">
                        {isMuted() ? "Unmute" : "Mute"}
                    </span>
                    <MicIcon size={20} />
                </button>
            )}
            <div className="connectedUserName">
                {getAvatarName(client.username)} {isLocalUser && "(You)"}
            </div>

            <audio
                ref={(instance) => {
                    if (instance) {
                        instance.volume = 0.9;
                        provideRef(instance, client.socketId);
                    }
                }}
            />
        </div>
    );
};

export default Client;

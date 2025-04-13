import React from "react";
import {
    getAvatarName,
    getAvatarShort,
    getRandomColor,
} from "../../utils/misc";
import "./style.css";
import MicOffIcon from "../../assets/MicOffIcon";
import MicIcon from "../../assets/MicIcon";

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
            className="connectedUserWrapper">
            <span
                className="connectedUserAvatar"
                style={{ backgroundColor: getRandomColor(index) }}>
                {getAvatarShort(client.username)}
                {isLocalUser && (
                    <button
                        className="muteToggleBtn"
                        style={{ color: "white" }}
                        onClick={toggleMute}
                        aria-label={isMuted() ? "Unmute" : "Mute"}
                        title={isMuted() ? "Unmute" : "Mute"}>
                        <span className="sr-only">
                            {isMuted() ? "Unmute" : "Mute"}
                        </span>
                        {isMuted() ? (
                            <MicOffIcon size={20} />
                        ) : (
                            <MicIcon size={20} />
                        )}
                    </button>
                )}
            </span>

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

import React from "react";
import Client from "../../components/client";
import "./style.css";
import useWebRTC from "../../hooks/useWebRTC";

const ClientsList = ({ clients, currentUserSocketId, socketRef, roomId }) => {
    const { provideRef, toggleMute, isMuted } = useWebRTC({
        roomId,
        socketRef,
    });
    return (
        <div className="clientsListWrapper">
            <h4>Connected</h4>
            <div className="connectedUsersWrapper">
                {clients.map((client, index) => (
                    <Client
                        key={client.socketId}
                        client={client}
                        index={index}
                        currentUserSocketId={currentUserSocketId}
                        provideRef={provideRef}
                        toggleMute={toggleMute}
                        isMuted={isMuted}
                    />
                ))}
            </div>
        </div>
    );
};

export default ClientsList;

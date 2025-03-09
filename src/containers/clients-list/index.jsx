import React from "react";
import Client from "../../components/client";
import "./style.css";

const ClientsList = ({ clients, currentUserSocketId }) => {
  return (
    <div>
      <h4>Connected</h4>
      <div className="connectedUsersWrapper">
        {clients.map((client, index) => (
          <Client key={client.socketId} client={client} index={index} currentUserSocketId={currentUserSocketId} />
        ))}
      </div>
    </div>
  );
};

export default ClientsList;

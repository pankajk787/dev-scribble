import React from "react";
import Client from "../../components/client";
import "./style.css";

const ClientsList = ({ clients }) => {
  return (
    <div>
      <h4>Connected</h4>
      <div className="connectedUsersWrapper">
        {clients.map((client) => (
          <Client key={client.socketId} client={client} />
        ))}
      </div>
    </div>
  );
};

export default ClientsList;

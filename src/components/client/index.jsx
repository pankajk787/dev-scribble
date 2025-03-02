import React from 'react';
import "./style.css";

const Client = ({ client}) => {
  return (
    <div className="connectedUserWrapper">
        <span className="">{client.username.charAt(0).toUpperCase()}</span>
        <div className="connectedUserName">{client.username}</div>
    </div>
  )
}

export default Client;

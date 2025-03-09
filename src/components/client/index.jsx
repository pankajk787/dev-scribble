import React from 'react';
import { getAvatarName, getAvatarShort, getRandomColor } from '../../utils/misc';
import "./style.css";

const Client = ({ client, index, currentUserSocketId }) => {
  
  return (
    <div className="connectedUserWrapper">
        <span className="" style={{ backgroundColor: getRandomColor(index) }}>{getAvatarShort(client.username)}</span>
        <div className="connectedUserName">{getAvatarName(client.username)}{currentUserSocketId === client.socketId && "(You)"}</div>
    </div>
  )
}

export default Client;

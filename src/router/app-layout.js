import React from "react";
import { Outlet } from "react-router-dom";
import CodeSyncLogo from "../assets/code-sync-logo.png";
import Client from "../components/client";
import ClientsList from "../containers/clients-list";

const AppLayout = () => {
    const [clients, setClients] = React.useState([{ socketId: "1", username: "Pankaj" }, { socketId: "2", username: "Rahul" }]);
  return (
    <div className="appLayoutWrapper">
      <aside className="leftPanelWrapper">
        <div className="logoWrapper dashedBorderBottom">
          <img src={CodeSyncLogo} alt="code-sync-logo" className="logoImage" />
          <div className="logoTextWrapper">
            <div className="logoText">Code Sync</div>
            <div className="logoTagLine">Realtime collaboration</div>
          </div>
        </div>
        <ClientsList clients={clients} />
        <div className="btnGroupWrapper">
            <button className="copyBtn">📋 Copy Room Id</button>
            <button className="leaveBtn">← Leave Room</button>
        </div>
      </aside>
      <main className="rightPanelWrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

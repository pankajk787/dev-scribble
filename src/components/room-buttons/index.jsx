import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useSelfDetailsStore from "../../store/self-details-slice";

const RoomButtons = ({ socketRef, roomId }) => {
  const navigate = useNavigate();
  const selfDetails = useSelfDetailsStore((state) => state.selfDetails);
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Copied to your clipboard!");
    } catch (e) {
      toast.error("Copy failed! Please try again.");
      console.error("Copy failed!", e);
    }
  };

  const onLeaveConfirm = async () => {
    socketRef.current.disconnect();
    navigate("/", { replace: true });
  };

  const leaveRoom = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave the room?"
    );
    if (confirmed) {
      onLeaveConfirm();
    }
  };
  return (
    <div className="btnGroupWrapper">
      {selfDetails?.isCreator && (
        <button className="copyBtn" onClick={copyRoomId}>
          📋 Copy Room Id
        </button>
      )}
      <button className="leaveBtn" onClick={leaveRoom}>
        ← Leave Room
      </button>
    </div>
  );
};

export default RoomButtons;

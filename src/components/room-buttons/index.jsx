import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useSelfDetailsStore from "../../store/self-details-slice";
import CLipboardIcon from "../../assets/icons/ClipboardIcon";
import LogoutIcon from "../../assets/icons/LogoutIcon";

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
                <button
                    className="copyBtn"
                    onClick={copyRoomId}>
                    <span className="btn-icon">
                        <CLipboardIcon />
                    </span>
                    <span className="btn-text">Copy Room Id</span>
                </button>
            )}
            <button
                className="leaveBtn"
                onClick={leaveRoom}>
                <span className="btn-icon">
                    <LogoutIcon />
                </span>
                <span className="btn-text">Leave Room</span>
            </button>
        </div>
    );
};

export default RoomButtons;

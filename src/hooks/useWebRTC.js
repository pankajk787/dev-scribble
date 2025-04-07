import { useEffect, useRef, useState } from "react";
import freeice from "freeice";
import ACTIONS from "../constants/actions";

export default function useWebRTC({ socketRef }) {
    const localMediaStream = useRef(null);
    const audioElements = useRef({});
    const connections = useRef({});
    const isMuted = useRef(true); // Track mute state
    const [, setRender] = useState(false);
    const provideAudioRef = (instance, socketId) => {
        audioElements.current[socketId] = instance;
    };

    const toggleMute = () => {
        if (!localMediaStream.current) return;
        localMediaStream.current.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        isMuted.current = !isMuted.current;
        setRender(prev => !prev); // Trigger re-render to update UI
    };

    useEffect(() => {
        const startLocalStream = async () => {
            try {
                localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });

                const localElement = audioElements.current[socketRef.current.id];
                if (localElement) {
                    localElement.srcObject = localMediaStream.current;
                    localElement.volume = 0.0;
                    localElement.muted = true; // Don't play own voice
                    await localElement.play().catch(err => {
                        console.error("[LocalStream] Error playing local stream", err);
                    });
                }

                // Mute by default (do not send audio to others)
                localMediaStream.current.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });

            } catch (error) {
                console.error("[LocalStream] Failed to access microphone", error);
            }
        };

        const stopLocalStream = async () => {
            if (localMediaStream.current && localMediaStream.current.getTracks) {
                localMediaStream.current.getTracks().forEach(track => {
                    try {
                        track.stop();
                    } catch (error) {
                        console.warn("Error stopping track", error);
                    }
                });
            }
        };

        startLocalStream();
        return () => {
            stopLocalStream();
            Object.keys(audioElements.current).forEach(socketId => {
                const audioElem = audioElements?.current[socketId];
                if (audioElem) {
                    audioElem.srcObject = null;
                }
            });
        };
    }, []);

    useEffect(() => {
        const createPeerConnection = async (peerSocketId) => {
            const pc = new RTCPeerConnection({ iceServers: freeice() });

            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => {
                    pc.addTrack(track, localMediaStream.current);
                });
            }

            pc.ontrack = ({ streams: [remoteStream] }) => {
                const audioElem = audioElements.current[peerSocketId];
                if (audioElem) {
                    audioElem.srcObject = remoteStream;
                    audioElem.muted = false;
                    audioElem.volume = 1.0;
                    audioElem.play().catch(err => console.warn("Autoplay failed:", err));
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current.emit(ACTIONS.ICE_CANDIDATE, {
                        to: peerSocketId,
                        candidate: event.candidate,
                    });
                }
            };

            connections.current[peerSocketId] = pc;
            return pc;
        };

        const socket = socketRef.current;

        const handleAnswer = async ({ from, answer }) => {
            const pc = connections.current[from];
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) {
                console.error(`[ANSWER] Error from ${from}`, err);
            }
        };

        const handleCandidate = async ({ from, candidate }) => {
            const pc = connections.current[from];
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error(`[ICE] Error from ${from}`, err);
            }
        };

        socket.on(ACTIONS.VOICE_CHAT_INITIATE, async ({ peerSocketId }) => {
            const pc = await createPeerConnection(peerSocketId);
            if (!pc) return;

            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit(ACTIONS.OFFER, { to: peerSocketId, offer });
            } catch (err) {
                console.error(`[OFFER] Error to ${peerSocketId}`, err);
            }
        });

        socket.on(ACTIONS.OFFER, async ({ from, offer }) => {
            const pc = await createPeerConnection(from);
            if (!pc) return;

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit(ACTIONS.ANSWER, { to: from, answer });
            } catch (err) {
                console.error(`[ANSWER] Error from ${from}`, err);
            }
        });

        socket.on(ACTIONS.ANSWER, handleAnswer);
        socket.on(ACTIONS.ICE_CANDIDATE, handleCandidate);

        return () => {
            socket.off(ACTIONS.VOICE_CHAT_INITIATE);
            socket.off(ACTIONS.OFFER);
            socket.off(ACTIONS.ANSWER, handleAnswer);
            socket.off(ACTIONS.ICE_CANDIDATE, handleCandidate);
        };
    }, [socketRef]);

    return {
        provideRef: provideAudioRef,
        toggleMute,
        isMuted: () => isMuted.current,
    };
}

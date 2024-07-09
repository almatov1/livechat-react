import React, { useEffect, useRef, useState } from 'react';
import { Peer } from "peerjs";

const WebRTCComponent: React.FC = () => {
  const [peerId, setPeerId] = useState<string>('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer>();

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (id) => {
      setPeerId(id);
      // socket.emit('join-room', id);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        handleVideoStream(localVideoRef, stream);
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          handleVideoStream(remoteVideoRef, remoteStream);
        });
      });
    });

    peerInstance.current = peer;

    return () => {
      peer.disconnect();
    };
  }, []);

  const handleVideoStream = (videoRef: React.RefObject<HTMLVideoElement>, stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = null; // Очистка текущего потока
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current!.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      };
    }
  };

  const callPeer = (id: string) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      handleVideoStream(localVideoRef, stream);
      const call = peerInstance.current!.call(id, stream);
      call.on('stream', (remoteStream) => {
        handleVideoStream(remoteVideoRef, remoteStream);
      });
    });
  };

  return (
    <div>
      <h1>Your Peer ID: {peerId}</h1>
      <input type="text" placeholder="Peer ID to call" onBlur={(e) => callPeer(e.target.value)} />
      <div>
        <h2>Local Video</h2>
        <video ref={localVideoRef} autoPlay />
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay />
      </div>
    </div>
  );
}

export default WebRTCComponent;

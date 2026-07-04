import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRoom } from '../api/rooms.js';
import socket from '../api/socket.js';

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [code, setCode] = useState('// start typing...');
  const isRemoteChange = useRef(false);

  useEffect(() => {
    getRoom(roomId)
      .then((res) => setRoom(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Room not found'));
  }, [roomId]);

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);

    socket.on('code-update', (incomingCode) => {
      isRemoteChange.current = true;
      setCode(incomingCode);
    });

    return () => {
      socket.off('code-update');
      socket.disconnect();
    };
  }, [roomId]);

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    if (!isRemoteChange.current) {
      socket.emit('code-change', { roomId, code: newCode });
    }
    isRemoteChange.current = false;
  };

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>{error}</p>;
  }

  if (!room) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading room...</p>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Room: {room.roomId}</h2>
      <p>Participants: {room.participants.length}</p>
      <textarea
        value={code}
        onChange={handleChange}
        style={{
          width: '100%',
          height: 400,
          fontFamily: 'monospace',
          fontSize: 14,
          padding: 12,
        }}
      />
    </div>
  );
}

export default RoomPage;
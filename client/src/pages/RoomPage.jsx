import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoom } from '../api/rooms.js';

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRoom(roomId)
      .then((res) => setRoom(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Room not found'));
  }, [roomId]);

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>{error}</p>;
  }

  if (!room) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading room...</p>;
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Room: {room.roomId}</h2>
      <p>Participants: {room.participants.length}</p>
      <p style={{ color: '#888' }}>
        The live code editor goes here — coming in Week 3.
      </p>
    </div>
  );
}

export default RoomPage;
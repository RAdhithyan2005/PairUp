import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../api/rooms.js';

function Dashboard() {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateRoom = async () => {
    setError('');
    try {
      const res = await createRoom();
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create room');
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId.trim()}`);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Dashboard</h2>

      <button onClick={handleCreateRoom} style={{ padding: 10, marginBottom: 24 }}>
        + Create new room
      </button>

      <form onSubmit={handleJoinRoom} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Enter room ID to join"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          style={{ padding: 8, width: '70%', marginRight: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>
          Join
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleLogout} style={{ padding: 10 }}>
        Log out
      </button>
    </div>
  );
}

export default Dashboard;
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRoom, getRoomHistory } from '../api/rooms.js';

function Dashboard() {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRoomHistory()
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

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

      <div style={{ marginBottom: 24 }}>
        <h4>Recent rooms</h4>
        {loadingHistory ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : history.length === 0 ? (
          <p style={{ color: '#888' }}>No rooms yet — create one above to get started.</p>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {history.map((room) => (
              <li key={room._id} style={{ marginBottom: 6 }}>
                <Link to={`/room/${room.roomId}`}>{room.roomId}</Link>
                {' — '}
                <span style={{ color: '#888', fontSize: 13 }}>
                  {room.participants.length} participant(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleLogout} style={{ padding: 10 }}>
        Log out
      </button>
    </div>
  );
}

export default Dashboard;
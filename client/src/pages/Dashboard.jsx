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
    <div className="dashboard-shell">
      <div className="dashboard-inner">
        <div className="eyebrow">
          <span className="cursor-blink" />
          PairUp
        </div>
        <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

        <button onClick={handleCreateRoom} className="btn-primary" style={{ marginBottom: 20 }}>
          + Create new room
        </button>

        <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Enter room ID to join"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            Join
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <div className="panel" style={{ marginBottom: 24 }}>
          <h4>Recent rooms</h4>
          {loadingHistory ? (
            <p className="text-muted">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-muted">No rooms yet — create one above to get started.</p>
          ) : (
            <ul className="room-list">
              {history.map((room) => (
                <li key={room._id}>
                  <Link to={`/room/${room.roomId}`} className="mono">
                    {room.roomId}
                  </Link>
                  <span className="text-muted">{room.participants.length} participant(s)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={handleLogout} className="btn-danger">
          Log out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getRoom } from '../api/rooms.js';
import { runCode } from '../api/execute.js';
import socket from '../api/socket.js';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [code, setCode] = useState('// start typing...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const isRemoteChange = useRef(false);
  const isRemoteTimerChange = useRef(false); 

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const [secondsLeft, setSecondsLeft] = useState(45 * 60); // default 45 min
  const [timerRunning, setTimerRunning] = useState(false);
  const [liveParticipants, setLiveParticipants] = useState(1);

  useEffect(() => {
    getRoom(roomId)
      .then((res) => {
        setRoom(res.data);
        if (res.data.code) {
          setCode(res.data.code);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Room not found'));
  }, [roomId]);

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);

    socket.on('code-update', (incomingCode) => {
      isRemoteChange.current = true;
      setCode(incomingCode);
    });

    socket.on('chat-message', ({ message, sender }) => {
      setMessages((prev) => [...prev, { message, sender, self: false }]);
    });

    socket.on('timer-update', ({ secondsLeft: remoteSeconds, timerRunning: remoteRunning }) => {
      isRemoteTimerChange.current = true;
      setSecondsLeft(remoteSeconds);
      setTimerRunning(remoteRunning);
    });

    socket.on('participant-count', (count) => {
      setLiveParticipants(count);
    });

    return () => {
      socket.off('code-update');
      socket.off('chat-message');
      socket.disconnect();
      socket.off('timer-update');
      socket.off('participant-count');
    };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) {
      setTimerRunning(false);
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

// Broadcast timer state to other participants whenever it changes locally
  useEffect(() => {
    if (isRemoteTimerChange.current) {
      isRemoteTimerChange.current = false;
      return;
    }
    socket.emit('timer-update', { roomId, secondsLeft, timerRunning });
  }, [secondsLeft, timerRunning, roomId]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (!isRemoteChange.current) {
      socket.emit('code-change', { roomId, code: value });
    }
    isRemoteChange.current = false;
  };
  
  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    try {
      const res = await runCode(language, code);
      setOutput(res.data.error ? res.data.error : res.data.output || '(no output)');
    } catch (err) {
      setOutput('Error running code');
    } finally {
      setRunning(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const messageData = { message: chatInput, sender: 'You' };
    setMessages((prev) => [...prev, { ...messageData, self: true }]);
    socket.emit('chat-message', { roomId, message: chatInput, sender: 'Peer' });
    setChatInput('');
  };

  const handleStartPauseTimer = () => {
    const newRunning = !timerRunning;
    setTimerRunning(newRunning);
    socket.emit('timer-update', { roomId, secondsLeft, timerRunning: newRunning });
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(45 * 60);
    socket.emit('timer-update', { roomId, secondsLeft: 45 * 60, timerRunning: false });
  };

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>{error}</p>;
  }

  if (!room) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading room...</p>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', fontFamily: 'sans-serif', display: 'flex', gap: 20 }}>
      <div style={{ flex: 2 }}>
        <h2>Room: {room.roomId}</h2>
        <p>Participants: {liveParticipants}</p>

        <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <button onClick={handleRun} disabled={running} style={{ padding: '6px 16px' }}>
            {running ? 'Running...' : 'Run'}
          </button>
        </div>

        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
        />

        <div style={{ marginTop: 16 }}>
          <h4>Output</h4>
          <pre
            style={{
              background: '#1e1e1e',
              color: '#fff',
              padding: 12,
              minHeight: 60,
              whiteSpace: 'pre-wrap',
            }}
          >
            {output}
          </pre>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, marginBottom: 16, textAlign: 'center' }}>
          <h4 style={{ marginTop: 0 }}>Timer</h4>
          <div style={{ fontSize: 28, fontFamily: 'monospace', marginBottom: 8 }}>
            {formatTime(secondsLeft)}
          </div>
          <button onClick={handleStartPauseTimer} style={{ marginRight: 8, padding: '4px 12px' }}>
            {timerRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={handleResetTimer} style={{ padding: '4px 12px' }}>
            Reset
          </button>
        </div>

        <div style={{ border: '1px solid #ccc', borderRadius: 6, padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ marginTop: 0 }}>Chat</h4>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300, marginBottom: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 6, textAlign: m.self ? 'right' : 'left' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: m.self ? '#DCF8C6' : '#f1f0f0',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                >
                  {m.message}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: 6 }}
            />
            <button type="submit" style={{ padding: '6px 12px' }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
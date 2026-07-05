import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getRoom } from '../api/rooms.js';
import { runCode } from '../api/execute.js';
import socket from '../api/socket.js';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
];

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [code, setCode] = useState('// start typing...');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
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

  const handleEditorChange = (value) => {
    setCode(value);
    if (!isRemoteChange.current) {
      socket.emit('code-change', { roomId, code: value });
    }
    isRemoteChange.current = false;
  };
  const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
];

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
  );
}

export default RoomPage;
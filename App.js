import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [inputName, setInputName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('message', (msg) => setChat((prev) => [...prev, msg]));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleLogin = () => {
    if (inputName.trim()) {
      setUsername(inputName);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const msgObj = {
        user: username,
        text: message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit('message', msgObj);
      setMessage('');
    }
  };

  if (!username) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2>Enter your username</h2>
        <input value={inputName} onChange={e => setInputName(e.target.value)} placeholder="Username" style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10, width: 220 }} />
        <button onClick={handleLogin} style={{ padding: '10px 24px', borderRadius: 8 }}>Join</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 12, background: '#fff', minHeight: 500 }}>
      <h2>Simple Chat</h2>
      <div style={{ minHeight: 300, maxHeight: 300, overflowY: 'auto', marginBottom: 16, background: '#f7f7f7', borderRadius: 8, padding: 12 }}>
        {chat.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <b>{msg.user}</b> [{msg.time}]: {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button onClick={sendMessage} disabled={!message.trim()} style={{ padding: '10px 18px', borderRadius: 8 }}>Send</button>
      </div>
    </div>
  );
}

export default App;
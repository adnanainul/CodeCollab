import React, { useEffect, useState } from 'react';
export default function Chat({ socket, username }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    useEffect(() => {
        if (!socket) return;
        const handle = (msg) => setMessages(prev => [...prev, msg]);
        socket.on('chat_message', handle);
        return () => socket.off('chat_message', handle);
    }, [socket]);
    const send = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        socket.emit('chat_message', { message: text });
        setText('');
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <div style={{
                flex: 1, overflow: 'auto', border: '1px solid #eee',
                padding: 8
            }}>
                {messages.map((m, idx) => (
                    <div key={idx} style={{ marginBottom: 6 }}>
                        <strong>{m.username}</strong>: <span>{m.message}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={send} style={{ display: 'flex', marginTop: 8 }}>
                <input value={text} onChange={e => setText(e.target.value)} style={{
                    flex: 1, padding: '8px'
                }} placeholder="Say something..." />
                <button type="submit" style={{ marginLeft: 8 }}>Send</button>
            </form>
        </div>
    );
}

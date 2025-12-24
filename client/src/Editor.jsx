import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import EditorArea from "./EditorArea";
import UserList from "./UserList";
import "./Editor.css";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
  transports: ["websocket"],
});


export default function Editor() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  const [users, setUsers] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const [language, setLanguage] = useState("python");
  const [darkMode, setDarkMode] = useState(true);

  const [initialContent, setInitialContent] = useState("");
  const [initialVersion, setInitialVersion] = useState(0);
  const [userColors, setUserColors] = useState({});
  const [output, setOutput] = useState("");
  const [currentCode, setCurrentCode] = useState("");

  const messagesRef = useRef(null);

  
  useEffect(() => {
    const usr = localStorage.getItem("user");
    if (!usr) {
      window.location.href = "/login";
      return;
    }

    const parsed = JSON.parse(usr);
    setUsername(parsed.username);

    
    setAvatar(`https://api.dicebear.com/7.x/thumbs/svg?seed=${parsed.username}`);
  }, []);

  
  useEffect(() => {
    socket.on("users_update", setUsers);

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => {
      socket.off("users_update");
      socket.off("chat_message");
    };
  }, []);

  
  const joinRoom = () => {
    if (!username || !roomId) return alert("Enter room ID");

    socket.emit(
      "join_room",
      { roomId, username, avatar },
      ({ content, version, users }) => {
        const defaultCode =
          language === "python"
            ? 'print("Hello from CodeCollab!")'
            : 'console.log("Hello from CodeCollab!");';
        setInitialContent(content || defaultCode);
        setInitialVersion(version);
        setUsers(users);

        const colors = {};
        users.forEach(
          (u) =>
          (colors[u.id] =
            "#" + Math.floor(Math.random() * 16777215).toString(16))
        );
        setUserColors(colors);

        setJoined(true);
      }
    );
  };

  
  const runCode = () => {
    socket.once("run_result", ({ output }) => setOutput(output));

    socket.emit("run_code", {
      language,
      code: currentCode,
    });
  };

  
  const sendMessage = () => {
    if (!chatMsg.trim()) return;

    socket.emit("chat_message", {
      username,
      text: chatMsg,
      avatar,
    });

    setChatMsg("");
  };

  
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  
  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-box">
          <h2 className="join-title">Join Room</h2>

          <input
            className="join-input"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button className="join-btn-full" onClick={joinRoom}>
            Join
          </button>

          {}
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className={`main-layout ${darkMode ? "dark" : "light"}`}>
      {}
      <div className="sidebar">
        <h3>Active Users</h3>
        <UserList users={users} userColors={userColors} />

        <h3>Chat</h3>
        <div className="chat-box" ref={messagesRef}>
          {messages.map((m, i) => (
            <div key={i} className="chat-message">
              <img src={m.avatar} alt="av" className="chat-avatar" />
              <div>
                <strong>{m.username}</strong>
                <div>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={chatMsg}
            onChange={(e) => setChatMsg(e.target.value)}
            placeholder="Say something..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      {}
      <div className="editor-section">
        <div className="top-bar">
          <img src={avatar} className="top-avatar" alt="user" />
          <span className="top-username">{username}</span>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>

          <button className="mode-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <button className="run-btn" onClick={runCode}>
            ▶ Run
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <EditorArea
          socket={socket}
          roomId={roomId}
          username={username}
          initialContent={initialContent}
          initialVersion={initialVersion}
          language={language}
          darkMode={darkMode}
          userColors={userColors}
          onCodeChange={setCurrentCode}
        />

        <div className="output-panel">
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}

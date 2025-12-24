import React from "react";

export default function UserList({ users = [], userColors = {} }) {
  if (!users.length) {
    return <p style={{ opacity: 0.6 }}>No users</p>;
  }

  return (
    <div>
      {users.map((u) => (
        <div className="user-list-item" key={u.id}>
          
          {}
          <img
            src={u.avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=guest"}
            alt="avatar"
            className="user-avatar"
          />

          {}
          <span className="user-name">{u.username}</span>

          {}
          <div
            className="user-status-dot"
            style={{ background: userColors[u.id] || "#00ff99" }}
          ></div>
        </div>
      ))}
    </div>
  );
}

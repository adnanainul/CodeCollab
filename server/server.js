const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const axios = require("axios");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  })
);

app.use("/auth", authRoutes);

// -------------------- DATABASE --------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/realtime_code")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// code model (simple)
const CodeSchema = new mongoose.Schema({
  roomId: String,
  content: String,
  version: Number,
});
const CodeModel = mongoose.model("Code", CodeSchema);

// -------------------- SOCKET SERVER --------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ["http://localhost:3000"] } });

const rooms = {}; // { roomId: [ { id, username, avatar } ] }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", async ({ roomId, username, avatar }, callback) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, username, avatar });

    let doc = await CodeModel.findOne({ roomId });
    if (!doc) {
      doc = await CodeModel.create({
        roomId,
        content: "",
        version: 0,
      });
    }

    // callback returns content/version and current users
    callback({
      content: doc.content,
      version: doc.version,
      users: rooms[roomId],
    });

    io.to(roomId).emit("users_update", rooms[roomId]);
  });

  // LIVE CODE SYNC
  socket.on("code_change", async ({ content, version }) => {
    const roomId = [...socket.rooms][1];
    if (!roomId) return;

    socket.to(roomId).emit("code_change", { content, version });
    await CodeModel.updateOne({ roomId }, { content, version });
  });

  // CURSOR BROADCAST
  socket.on("cursor_change", ({ roomId, socketId, cursor }) => {
    socket.to(roomId).emit("cursor_change", { socketId, cursor });
  });

  // RUN CODE
  socket.on("run_code", async ({ language, code }) => {
    const langMap = {
      python: { lang: "python", version: "3.10.0" },
      javascript: { lang: "javascript", version: "18.15.0" },
      cpp: { lang: "cpp", version: "10.2.0" },
    };

    const selected = langMap[language];
    if (!selected) {
      socket.emit("run_result", { output: "Unsupported Language" });
      return;
    }

    try {
      const resp = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: selected.lang,
        version: selected.version,
        files: [{ content: code }],
      });

      socket.emit("run_result", { output: resp.data.run.output || "" });
    } catch (err) {
      console.log("RUN ERROR:", err.message || err);
      socket.emit("run_result", { output: "Execution Error" });
    }
  });

  // CHAT
  socket.on("chat_message", (msg) => {
    const roomId = [...socket.rooms][1];
    if (!roomId) return;

    io.to(roomId).emit("chat_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    for (let room in rooms) {
      rooms[room] = rooms[room].filter((u) => u.id !== socket.id);
      io.to(room).emit("users_update", rooms[room]);
    }
  });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("Server running on", PORT));

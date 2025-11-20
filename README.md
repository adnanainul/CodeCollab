# realtime-collab-editor (Minimal)
This project is a minimal real-time collaborative code editor scaffold using:
- **Server**: Express + Socket.IO + MongoDB (Mongoose)
- **Client**: React + Monaco Editor + Socket.IO client
## Setup
1. Clone or copy files into a folder named `project/`.
### Server
```bash
cd project/server
npm install
# optionally set MONGO_URI in env
npm run dev
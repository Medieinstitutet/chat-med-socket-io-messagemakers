import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const PORT = 3000;

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface User {
  socketId: string;
  name: string;
  room: string;
  isActive: boolean;
}
interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
}

const users: User[] = [];
const chatHistory: { [room: string]: Message[] } = {};

const userJoin = (id: string, name: string, room: string): User | null => {
  const existingUser = users.find(
    (user) => user.room === room && user.name === name && user.isActive
  );

  if (existingUser) {
    return null;
  } else {
    const user = { socketId: id, name, room, isActive: true };
    users.push(user);
    return user;
  }
};

const userLeave = (id: string): User | undefined => {
  const user = users.find((user) => user.socketId === id);
  if (user) {
    user.isActive = false;
  }
  return user;
};

const addMessageToHistory = (room: string, message: Message) => {
  if (!chatHistory[room]) {
    chatHistory[room] = [];
  }
  chatHistory[room].push(message);
};

io.on("connection", (socket: Socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const user = userJoin(socket.id, name, room);

    if (!user) {
      return callback(
        "Användarnamnet är redan taget i detta rum, vänligen välj ett annat."
      );
    }

    socket.join(user.room);

    socket.emit("loadHistory", chatHistory[user.room] || []);

    socket.emit("message", {
      user: "Server",
      text: `${user.name}, välkommen till rum ${room}.`,
    });

    socket.broadcast.to(user.room).emit("message", {
      user: "Server",
      text: `${user.name} har anslutit till rummet.`,
    });
    callback(null);
  });

  socket.on("sendMessage", ({ message, room }, callback) => {
    const user = users.find((user) => user.socketId === socket.id);
    if (user) {
      const msg = {
        id: Date.now(),
        user: user.name,
        text: message,
        time: new Date().toISOString(),
      };
      addMessageToHistory(user.room, msg);
      io.to(user.room).emit("message", msg);
    }
    callback();
  });

  socket.on("editMessage", ({ messageId, newText, room }, callback) => {
    const roomMessages = chatHistory[room];
    if (roomMessages) {
      const messageIndex = roomMessages.findIndex(
        (message) => message.id === messageId
      );
      if (messageIndex !== -1) {
        roomMessages[messageIndex].text = newText;
        io.to(room).emit("messageEdited", roomMessages[messageIndex]);
      }
    }
    callback();
  });

  socket.on("leaveRoom", () => {
    const user = userLeave(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} har lämnat rummet.`,
      });
      socket.leave(user.room);
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} har lämnat chatten.`,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

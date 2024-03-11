import React, { useState, useEffect } from "react";
import io from "socket.io-client";

interface ErrorObj {
  message: string;
  code?: number;
}

const socket = io("http://localhost:3000");

const Chat: React.FC = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ user: string; text: string; id: number }>
  >([]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((msgs) => [...msgs, message]);
    });
  }, []);

  useEffect(() => {
    socket.on("loadHistory", (history) => {
      setMessages(history);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("messageEdited", (editedMessage) => {
      setMessages((currentMessages) =>
        currentMessages.map((msg) =>
          msg.id === editedMessage.id
            ? { ...msg, text: editedMessage.text }
            : msg
        )
      );
    });
  }, [socket]);

  const joinRoom = () => {
    if (name && room) {
      socket.emit("join", { name, room }, (error: ErrorObj | null) => {
        if (error) {
          alert(error);
        }
      });
    }
  };

  const sendMessage = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (message && room) {
      socket.emit("sendMessage", { message, room }, () => setMessage(""));
    }
  };

  const editMessage = (messageId: number, newText: string) => {
    socket.emit("editMessage", { messageId, newText, room }, () => {});
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setMessages([]);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
        />
      </div>
      <div>
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            style={{ color: msg.user === name ? "blue" : "black" }}
          >
            {msg.user}: {msg.text}
            {msg.user === name && (
              <button
                onClick={() => {
                  const newText = prompt("Edit your message", msg.text);
                  if (newText) {
                    editMessage(msg.id, newText);
                  }
                }}
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={leaveRoom}>Lämna Rum</button>
    </div>
  );
};

export default Chat;

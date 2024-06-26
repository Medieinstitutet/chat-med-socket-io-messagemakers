import React, { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import "../styles/main.scss";
import blueProfileImage from "../assets/blue.png";
import blackProfileImage from "../assets/black.png";
import adminProfileImage from "../assets/admin.jpg";
import serverProfileImage from "../assets/server.jpg";

interface ErrorObj {
  message: string;
  code?: number;
}

export const Chat: React.FC = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ user: string; text: string; id: number }>
  >([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket == null) return;

    const messageListener = (message: {
      user: string;
      text: string;
      id: number;
    }) => {
      setMessages((msgs) => [...msgs, message]);
    };

    const loadHistoryListener = (
      history: Array<{ user: string; text: string; id: number }>
    ) => {
      setMessages(history);
    };

    const messageEditedListener = (editedMessage: {
      id: number;
      text: string;
    }) => {
      setMessages((currentMessages) =>
        currentMessages.map((msg) =>
          msg.id === editedMessage.id
            ? { ...msg, text: editedMessage.text }
            : msg
        )
      );
    };

    socket.on("message", messageListener);
    socket.on("loadHistory", loadHistoryListener);
    socket.on("messageEdited", messageEditedListener);

    return () => {
      socket.off("message", messageListener);
      socket.off("loadHistory", loadHistoryListener);
      socket.off("messageEdited", messageEditedListener);
    };
  }, [socket, room]);

  const joinRoom = () => {
    if (!name || !room) {
      alert("Namn och rum krävs.");
      return;
    }

    if (isInRoom) {
      socket?.emit("leaveRoom");
      setMessages([]);
    }

    socket?.emit("join", { name, room }, (error: ErrorObj | null) => {
      if (error) {
        alert(error.message);
      } else {
        setIsInRoom(true);
      }
    });
  };

  const sendMessage = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (message && room) {
      socket?.emit("sendMessage", { message, room }, () => setMessage(""));
    }
  };

  const editMessage = (messageId: number, newText: string) => {
    socket?.emit("editMessage", { messageId, newText, room }, () => {});
  };

  const leaveRoom = () => {
    socket?.emit("leaveRoom");
    setMessages([]);
    setIsInRoom(false);
  };

  return (
    <div className="chat-container">
      <div className="input-container">
        <input
          type="text"
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="name-input"
        />
        <input
          type="text"
          placeholder="Rum"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="room-input"
        />
        <button onClick={joinRoom} className="join-room-button">
          Gå med i rum
        </button>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.user === name ? "message blue" : "message black"}
          >
            <img
              src={
                msg.user === "admin"
                  ? adminProfileImage
                  : msg.user === "Server"
                  ? serverProfileImage
                  : msg.user === name
                  ? blueProfileImage
                  : blackProfileImage
              }
              alt="Profile"
              className="profile-image"
            />
            {msg.user}: {msg.text}
            {msg.user === name && (
              <button
                onClick={() => {
                  const newText = prompt("Redigera dit meddelande", msg.text);
                  if (newText) {
                    editMessage(msg.id, newText);
                  }
                }}
                className="edit-button"
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <input
          type="text"
          placeholder="Skriv ditt meddelande..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
          className="message-input"
        />
      </div>

      <button onClick={leaveRoom} className="leave-room-button">
        Lämna rummet
      </button>
    </div>
  );
};

export default Chat;

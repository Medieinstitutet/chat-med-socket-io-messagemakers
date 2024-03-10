import express from "express";
import { Server, Socket } from "socket.io";
import cors from "cors";

const PORT = 3000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

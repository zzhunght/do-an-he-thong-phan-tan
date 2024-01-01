const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());
const user = {};
const history = [];
let sum = 0;

io.on("connection", (socket) => {
  console.log("A user connected. Socket ID:", socket.id);
  const id = socket.id;
  user[`${id}`] = {};
  socket.emit("return_id_connect", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("another-left", id);
    delete user[`${id}`];

    if (user == {}) {
      sum = 0;
    }
  });

  socket.on("client-message", (message) => {
    console.log("Received message from client:", message);
    io.emit("server-message", `Server received: ${message}`);
  });

  //receiver number
  socket.on("client-send-number", (message) => {
    let reason = "";
    let success = false;
    const received = parseInt(message);
    if (!message) {
      reason = "Bạn chưa nhập số";
    } else if (received <= 10 && received >= 1) {
      sum += received;
      success = true;
    } else {
      reason = "Nhập lại số trong khoảng từ 1-10";
    }
    const msg = {
      name: user[`${id}`].name,
      address: user[`${id}`].address,
      time: new Date(),
      id: socket.id,
      message: received,
      success: success,
      reason: reason,
    }
    io.emit("message-from-another",msg );
    history.push(msg)
    io.emit("server-sum", sum);
  });
  console.log("another address:", socket.handshake.address);

  socket.on("login", (name) => {
    console.log("another user login:", name);
    user[`${id}`].name = name;
    const address = socket.handshake.address;
    const timeJoin = new Date();
    user[`${id}`].address = address; 
    user[`${id}`].time = timeJoin;
    socket.emit('login-return', {
      name: name, 
      address: address,
      history: history,
      sum: sum
    })
    io.emit("update-user", user);
  });
});

server.listen(5000, () => {
  console.log("server running at http://localhost:5000");
});

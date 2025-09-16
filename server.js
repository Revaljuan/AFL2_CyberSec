const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer();
const io = socketIo(server);

// Menyimpan username dan public key pengguna
const users = new Map();

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`);

  // Kirim semua user yang sudah terdaftar ke client baru
  socket.emit("init", Array.from(users.entries()));

  // Mendaftar public key
  socket.on("registerPublicKey", (data) => {
    const { username, publicKey } = data;
    users.set(username, publicKey);
    console.log(`${username} registered with public key.`);
    io.emit("newUser", { username, publicKey });
  });

  // Event pesan normal
  socket.on("message", (data) => {
    const { username, message } = data;
    io.emit("message", { username, message });
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

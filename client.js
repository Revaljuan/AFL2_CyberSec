const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let username = "";
let registeredUsername = "";
let targetUsername = "";
const users = new Map();

// Generate key pair RSA untuk client
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "pkcs1", format: "pem" },
  privateKeyEncoding: { type: "pkcs1", format: "pem" },
});

function encryptMessage(message, targetPublicKey) {
  return crypto.publicEncrypt(targetPublicKey, Buffer.from(message)).toString("base64");
}

function decryptMessage(encryptedMessage) {
  return crypto.privateDecrypt(privateKey, Buffer.from(encryptedMessage, "base64")).toString();
}

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    registeredUsername = input;
    console.log(`Welcome, ${username} to the chat`);

    // Kirim public key ke server
    socket.emit("registerPublicKey", {
      username,
      publicKey,
    });

    rl.prompt();

    rl.on("line", (message) => {
      if (!message.trim()) return;

      if ((match = message.match(/^!secret (\w+)$/))) {
        targetUsername = match[1];
        console.log(`Now secretly chatting with ${targetUsername}`);
      } else if (message.match(/^!exit$/)) {
        console.log(`No more secretly chatting with ${targetUsername}`);
        targetUsername = "";
      } else {
        if (targetUsername && users.has(targetUsername)) {
          const targetKey = users.get(targetUsername);
          const encrypted = encryptMessage(message, targetKey);
          socket.emit("message", { username, message: encrypted });
        } else {
          socket.emit("message", { username, message });
        }
      }
      rl.prompt();
    });
  });
});

// Terima daftar user
socket.on("init", (keys) => {
  keys.forEach(([user, key]) => users.set(user, key));
  console.log(`\nThere are currently ${users.size} users in the chat`);
  rl.prompt();
});

// User baru join
socket.on("newUser", (data) => {
  const { username, publicKey } = data;
  users.set(username, publicKey);
  console.log(`${username} joined the chat`);
  rl.prompt();
});

// Terima pesan
socket.on("message", (data) => {
  let { username: senderUsername, message: senderMessage } = data;

  if (senderUsername !== username) {
    // Coba dekripsi jika pesan terenkripsi
    try {
      senderMessage = decryptMessage(senderMessage);
    } catch (err) {
      // Jika gagal dekripsi, tampilkan apa adanya
    }
    console.log(`${senderUsername}: ${senderMessage}`);
    rl.prompt();
  }
});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting...");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting...");
  socket.disconnect();
  rl.close();
  process.exit(0);
});

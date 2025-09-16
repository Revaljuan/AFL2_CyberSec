Node.js Secure Chat Application
Sebuah aplikasi chat real-time berbasis Node.js dan Socket.IO dengan fitur:
Chat normal dan chat rahasia terenkripsi menggunakan RSA
Registrasi public key untuk setiap user
Pesan rahasia hanya bisa dibaca oleh target user
Support multiple client
Contoh malicious server untuk simulasi pesan dimodifikasi

📂 Struktur Project
node-chat-app/
├── server.js           # Server normal
├── malicious-server.js # Server nakal (modifikasi pesan)
├── client.js           # Client chat dengan RSA
├── package.json

🚀 Cara Menjalankan
Install dependencies:
npm install
Jalankan server normal:
node server.js
atau server nakal:
node malicious-server.js
Jalankan client di terminal lain:
node client.js

💬 Fitur Chat
Chat normal: semua user bisa saling bertukar pesan
Chat rahasia: gunakan perintah !secret <username> untuk mengirim pesan terenkripsi
Keluar dari chat rahasia: !exit
Pesan rahasia hanya bisa didekripsi oleh user target

🔐 Catatan Keamanan
Setiap user memiliki key pair RSA sendiri
Public key dikirim ke server, private key disimpan di client
Server tidak mengetahui isi pesan rahasia

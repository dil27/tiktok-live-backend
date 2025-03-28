const { WebcastPushConnection } = require('tiktok-live-connector');
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
})

let tiktokUsername = "rumiruthea";

let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

let db = null;

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.log(state.roomInfo.cover.url_list);
    console.log(state);
    console.info(`Connected to roomId ${state.roomId}`);

    // db = mysql.createConnection({
    //     host: "localhost",
    //     user: "root",
    //     password: "",
    //     database: "tiktok_chat"
    // });
    
    // db.connect(err => {
    //     if (err) {
    //         console.error("Database connection failed:", err);
    //         return;
    //     }
    //     console.log("Connected to MySQL database");
    // });
}).catch(err => {
    console.error('Failed to connect', err);
})

tiktokLiveConnection.on('chat', data => {
    console.log(`============= ${data.nickname} (@${data.uniqueId}): ${data.comment}`);
    if (db) {
        insertMessage(data);
    }
});

tiktokLiveConnection.on('gift', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
});

function insertMessage(data) {
    const query = "INSERT INTO chats (nickname, unique_id, message, created_at) VALUES (?, ?, ?, ?)";
    db.query(query, [data.nickname, data.uniqueId, data.comment, new Date()], (err, result) => {
        if (err) {
            console.error("Failed to insert chat data:", err);
        } else {
            console.log("Chat data inserted into database:", result.insertId);
        }
    });
}

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})
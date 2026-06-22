const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 8002;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const players = {};

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    players[id] = { x: 0, y: 0, angle: 0 };
    console.log(`Player connected: ${id}`);

    ws.send(JSON.stringify({ type: 'id', id }));

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            players[id] = { x: msg.x, y: msg.y, angle: msg.angle };

            const allPlayers = {};
            for (const pid in players) {
                if (pid !== id) {
                    allPlayers[pid] = players[pid];
                }
            }
            ws.send(JSON.stringify(allPlayers));
        } catch (e) {
            console.error('Error:', e);
        }
    });

    ws.on('close', () => {
        delete players[id];
        console.log(`Player disconnected: ${id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server hosted on ${PORT}`);
});
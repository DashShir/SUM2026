const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8002 });

wss.on('connection', (ws) => {
    console.log('Player connected!');
    ws.send('Hi');
});

console.log('server 8002');
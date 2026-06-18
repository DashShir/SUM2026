export class NetworkManager {
    constructor(serverUrl) {
        this.url = serverUrl;
        this.socket = null;
        this.otherPlayers = {};
    }

    connect() {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log("[NETWORK] Connected!");
        };

        this.socket.onmessage = (event) => {
            this.otherPlayers = JSON.parse(event.data);
        };

        this.socket.onclose = () => console.log("[NETWORK] Connection closed");
        this.socket.onerror = (err) => console.error("[NETWORK] Error:", err);
    }

    sendUpdate(x, y, angle) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ x, y, angle }));
        }
    }
}
export class Network {
    constructor(serverUrl) {
        this.url = serverUrl;
        this.socket = null;
        this.otherPlayers = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
    }

    connect() {
        try {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                console.log("[NETWORK] Connected!");
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (event) => {
                try {
                    const freshData = JSON.parse(event.data);

                    for (const id in freshData) {
                        const newP = freshData[id];
                        const oldP = this.otherPlayers[id];

                        if (oldP) {
                            const distanceMoved = Math.hypot(newP.x - oldP.x, newP.y - oldP.y);
                            newP.isMoving = distanceMoved > 0.0001;
                        } else {
                            newP.isMoving = false;
                        }
                    }

                    this.otherPlayers = freshData;
                } catch (error) {
                    console.error('[NETWORK] Error parsing message:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log("[NETWORK] Connection closed");
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error("[NETWORK] Error:", error);
            };

        } catch (error) {
            console.error('[NETWORK] Connection failed:', error);
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[NETWORK] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        }
    }

    sendUpdate(x, y, angle) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const data = JSON.stringify({ x, y, angle });
            this.socket.send(data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
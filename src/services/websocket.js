class WebSocketService {
    constructor() {
        this.ws = null;
        this.url = 'ws://127.0.0.1:8080';
        this.reconnectInterval = 3000;
        this.maxReconnectAttempts = 5;
        this.reconnectAttempts = 0;
        this.messageHandlers = new Set();
        this.connectionHandlers = new Set();
        this.isConnecting = false;
        this.shouldReconnect = true;
    }

    connect(token) {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return Promise.resolve();
        }

        this.isConnecting = true;
        
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            try {
                // Include token in WebSocket URL for authentication
                const wsUrl = token ? `${this.url}?token=${encodeURIComponent(token)}` : this.url;
                console.log('Connecting to WebSocket:', wsUrl);
                this.ws = new WebSocket(wsUrl);

                // Set connection timeout
                timeoutId = setTimeout(() => {
                    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
                        console.log('WebSocket connection timeout');
                        this.ws.close();
                        this.isConnecting = false;
                        reject(new Error('WebSocket connection timeout. Server may not be running.'));
                    }
                }, 10000);

                this.ws.onopen = () => {
                    console.log('WebSocket connected successfully');
                    clearTimeout(timeoutId);
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.notifyConnectionHandlers('connected');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('WebSocket message received:', data);
                        this.notifyMessageHandlers(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
                    clearTimeout(timeoutId);
                    this.isConnecting = false;
                    this.notifyConnectionHandlers('disconnected');
                    
                    // Only attempt to reconnect for unexpected closures and if we should reconnect
                    if (this.shouldReconnect && event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect(token);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error occurred:', error);
                    clearTimeout(timeoutId);
                    this.isConnecting = false;
                    this.notifyConnectionHandlers('error');
                    reject(new Error('WebSocket connection failed. Make sure the WebSocket server is running on port 8080.'));
                };

            } catch (error) {
                clearTimeout(timeoutId);
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    scheduleReconnect(token) {
        if (!this.shouldReconnect) {
            console.log('Reconnection disabled, not attempting to reconnect');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (this.shouldReconnect) {
                this.connect(token).catch(console.error);
            }
        }, this.reconnectInterval);
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                return false;
            }
        } else {
            console.error('WebSocket is not connected. Current state:', this.ws ? this.ws.readyState : 'null');
            return false;
        }
    }

    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    addConnectionHandler(handler) {
        this.connectionHandlers.add(handler);
    }

    removeConnectionHandler(handler) {
        this.connectionHandlers.delete(handler);
    }

    notifyMessageHandlers(data) {
        this.messageHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }

    notifyConnectionHandlers(status) {
        this.connectionHandlers.forEach(handler => {
            try {
                handler(status);
            } catch (error) {
                console.error('Error in connection handler:', error);
            }
        });
    }

    disconnect() {
        this.shouldReconnect = false;
        if (this.ws) {
            try {
                this.ws.close(1000, 'Manual disconnect');
            } catch (error) {
                console.error('Error closing WebSocket:', error);
            }
            this.ws = null;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;

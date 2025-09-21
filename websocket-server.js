const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info) => {
        // Parse the query parameters
        const query = url.parse(info.req.url, true).query;
        
        // For now, accept any connection with a token parameter
        // In production, you'd validate the token against your Laravel backend
        if (query.token) {
            console.log('WebSocket connection attempt with token:', query.token);
            return true;
        }
        
        console.log('WebSocket connection rejected: No token provided');
        return false;
    }
});

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
    // Parse token from URL
    const query = url.parse(req.url, true).query;
    const token = query.token;
    
    console.log(`New WebSocket connection from token: ${token}`);
    
    // Store client with token
    clients.set(ws, { token, userId: token.split('|')[0] }); // Simple user ID extraction
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to WebSocket server',
        timestamp: new Date().toISOString()
    }));
    
    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received message:', message);
            
            // Get client info
            const clientInfo = clients.get(ws);
            
            if (message.type === 'message') {
                // Broadcast the exact message data received from the frontend
                const broadcastData = {
                    type: 'message',
                    message: message.message // Use the message data as-is from the API response
                };
                
                // Send to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(broadcastData));
                    }
                });
                
            } else if (message.type === 'typing') {
                // Broadcast typing indicator to other clients
                const typingData = {
                    type: 'typing',
                    userId: clientInfo.userId,
                    userName: `User ${clientInfo.userId}`,
                    isTyping: message.isTyping
                };
                
                // Send to all clients except sender
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(typingData));
                    }
                });
            }
            
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
        const clientInfo = clients.get(ws);
        console.log(`Client disconnected: ${clientInfo?.token}`);
        
        // Clean up ping interval
        clearInterval(pingInterval);
        clients.delete(ws);
        
        // Notify other clients about user leaving
        const leaveData = {
            type: 'user_left',
            userId: clientInfo?.userId,
            userName: `User ${clientInfo?.userId}`,
            timestamp: new Date().toISOString()
        };
        
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leaveData));
            }
        });
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
    console.log('📱 Ready to handle chat connections!');
    console.log('💡 Make sure your React app is connecting to this server');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📴 Shutting down WebSocket server...');
    wss.clients.forEach((client) => {
        client.close();
    });
    server.close(() => {
        console.log('✅ WebSocket server closed');
        process.exit(0);
    });
});

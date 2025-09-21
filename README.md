# Real-Time Chat Application

A beautiful real-time chat application built with React frontend and Laravel backend, featuring WebSocket integration for instant messaging.

## 🚀 Features

- **Real-time messaging** with WebSocket connections
- **Beautiful modern UI** with glassmorphism design
- **User authentication** with Laravel Sanctum API tokens
- **Typing indicators** to show when users are typing
- **Message persistence** stored in Laravel backend
- **Responsive design** for mobile and desktop
- **Connection status** indicators

## 🛠️ Tech Stack

### Frontend
- **React** 18+ (Create React App)
- **Axios** for API communication
- **WebSocket** for real-time features
- **Styled JSX** for component styling

### Backend (Separate Repository)
- **Laravel** 10+ with API routes
- **Laravel Sanctum** for authentication
- **MySQL** database for message storage

### WebSocket Server
- **Node.js** WebSocket server for real-time communication
- **WebSocket (ws)** library

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- Laravel backend running on `http://127.0.0.1:8000`

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/princegupta04/websocket-frontend.git
cd websocket-frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

### WebSocket Server Setup
```bash
# Install WebSocket server dependencies
npm install ws

# Start the WebSocket server
node websocket-server.js
```

## 🔧 Configuration

### API Configuration
The frontend is configured to connect to:
- **Laravel API**: `http://127.0.0.1:8000/api`
- **WebSocket Server**: `ws://127.0.0.1:8080`

Update these URLs in `/src/services/api.js` and `/src/services/websocket.js` if your backend runs on different ports.

### Authentication
The app uses Laravel Sanctum API tokens stored in localStorage:
- Login returns a token that's stored locally
- All API requests include the Bearer token
- WebSocket connections authenticate using the token

## 🎯 Usage

1. **Start your Laravel backend** on port 8000
2. **Start the WebSocket server**: `node websocket-server.js`
3. **Start the React app**: `npm start`
4. **Open multiple browser tabs** to test real-time messaging
5. **Register/Login** with different users to see live chat

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.js          # Login/Register component
│   ├── Chat.js          # Main chat interface
│   └── ApiTest.js       # API testing component
├── services/
│   ├── api.js           # Axios API service
│   └── websocket.js     # WebSocket service
├── App.js               # Main application component
└── index.js             # App entry point

websocket-server.js      # Node.js WebSocket server
package.json             # Frontend dependencies
```

## 🌟 Key Features Explained

### Real-Time Messaging
- Messages are sent via Laravel API for persistence
- WebSocket server broadcasts messages to all connected clients
- Duplicate prevention ensures messages appear only once

### Message Positioning
- Your messages appear on the RIGHT (blue bubbles)
- Other users' messages appear on the LEFT (gray bubbles)
- Avatar initials show for each user

### Connection Management
- Auto-reconnection if WebSocket connection is lost
- Connection status indicator (Online/Connecting/Offline)
- Ping/pong mechanism keeps connections alive

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
# Build for production
npm run build

# Deploy the build folder
```

### WebSocket Server (Railway/Heroku)
- Deploy `websocket-server.js` with `package.json`
- Set environment variables for production ports
- Update frontend WebSocket URL to production server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Prince Gupta**
- GitHub: [@princegupta04](https://github.com/princegupta04)

---

⭐ Star this repo if you found it helpful!

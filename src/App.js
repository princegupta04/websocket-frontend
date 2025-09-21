import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';
import ApiTest from './components/ApiTest';
import './App.css';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <div className="app">
            <ApiTest />
            <div className="app-container">
                {!user ? (
                    <Auth onLogin={handleLogin} />
                ) : (
                    <>
                        <div className="app-header">
                            <h1>💬 Real-Time Chat</h1>
                            <div className="user-info">
                                <span>Welcome, {user.name}!</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </div>
                        <Chat user={user} />
                    </>
                )}
            </div>
        </div>
    );
};

export default App;
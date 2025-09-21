import React, { useState } from 'react';
import api from '../services/api';

const Auth = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        console.log('Attempting authentication...');
        
        try {
            const endpoint = isRegistering ? '/register' : '/login';
            const payload = isRegistering 
                ? { name, email, password, password_confirmation: passwordConfirmation }
                : { email, password };
            
            console.log(`Making ${isRegistering ? 'registration' : 'login'} request to:`, `http://127.0.0.1:8000/api${endpoint}`);
            console.log('Payload:', { ...payload, password: '[HIDDEN]', password_confirmation: '[HIDDEN]' });
            
            const response = await api.post(endpoint, payload);
            
            console.log('Authentication successful:', response.data);
            
            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Clear form
            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirmation('');
            
            // Trigger login callback
            onLogin();

        } catch (err) {
            console.error('Authentication error:', err);
            console.error('Error response:', err.response?.data);
            
            // Handle different types of errors
            let errorMessage = 'An error occurred during authentication.';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.errors) {
                // Handle Laravel validation errors
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0];
                errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-icon">
                        💬
                    </div>
                    <h1 className="auth-title">Real-Time Chat</h1>
                    <p className="auth-subtitle">
                        {isRegistering 
                            ? 'Create your account to start chatting' 
                            : 'Welcome back! Please sign in to continue'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {isRegistering && (
                        <div className="input-group">
                            <div className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="auth-input"
                                required={isRegistering}
                            />
                        </div>
                    )}
                    
                    <div className="input-group">
                        <div className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="m4 4 16 16M20 8l-8 5M4 8l8 5" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>

                    {isRegistering && (
                        <div className="input-group">
                            <div className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="auth-input"
                                required={isRegistering}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="auth-button">
                        <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </button>
                </form>

                {/* Toggle */}
                <div className="auth-toggle">
                    <span className="toggle-text">
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button 
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="toggle-button"
                    >
                        {isRegistering ? 'Sign In' : 'Create Account'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .auth-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .auth-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                    animation: bounce 2s infinite;
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }

                .auth-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 8px 0;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .auth-subtitle {
                    color: #6b7280;
                    font-size: 0.95rem;
                    margin: 0;
                    line-height: 1.5;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    z-index: 2;
                    transition: color 0.2s ease;
                }

                .auth-input {
                    width: 100%;
                    padding: 16px 16px 16px 52px;
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    font-size: 1rem;
                    background: white;
                    transition: all 0.2s ease;
                    outline: none;
                    box-sizing: border-box;
                }

                .auth-input:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .auth-input:focus + .input-icon,
                .input-group:focus-within .input-icon {
                    color: #667eea;
                }

                .auth-input::placeholder {
                    color: #9ca3af;
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ef4444;
                    font-size: 0.875rem;
                    background: rgba(239, 68, 68, 0.1);
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .auth-button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 16px 24px;
                    border-radius: 16px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 8px;
                }

                .auth-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                }

                .auth-button:active {
                    transform: translateY(0);
                }

                .auth-toggle {
                    text-align: center;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid #e5e7eb;
                }

                .toggle-text {
                    color: #6b7280;
                    font-size: 0.9rem;
                    margin-right: 8px;
                }

                .toggle-button {
                    background: none;
                    border: none;
                    color: #667eea;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    transition: color 0.2s ease;
                }

                .toggle-button:hover {
                    color: #764ba2;
                }

                /* Responsive Design */
                @media (max-width: 480px) {
                    .auth-container {
                        padding: 16px;
                    }

                    .auth-card {
                        padding: 32px 24px;
                        border-radius: 20px;
                    }

                    .auth-title {
                        font-size: 1.75rem;
                    }

                    .auth-icon {
                        font-size: 2.5rem;
                    }
                }

                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .auth-card {
                        background: rgba(31, 41, 55, 0.95);
                        border: 1px solid rgba(75, 85, 99, 0.3);
                    }

                    .auth-title {
                        color: #f9fafb;
                    }

                    .auth-subtitle {
                        color: #d1d5db;
                    }

                    .toggle-text {
                        color: #d1d5db;
                    }

                    .auth-input {
                        background: rgba(55, 65, 81, 0.5);
                        border-color: #4b5563;
                        color: #f9fafb;
                    }

                    .auth-input::placeholder {
                        color: #9ca3af;
                    }

                    .auth-input:focus {
                        border-color: #667eea;
                        background: rgba(55, 65, 81, 0.7);
                    }
                }
            `}</style>
        </div>
    );
};

export default Auth;
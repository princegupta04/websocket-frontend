// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ApiTest = () => {
    // eslint-disable-next-line no-unused-vars
    const [apiStatus, setApiStatus] = useState('Testing...');
    // eslint-disable-next-line no-unused-vars
    const [loginTest, setLoginTest] = useState('Not tested');
    // eslint-disable-next-line no-unused-vars
    const [messagesTest, setMessagesTest] = useState('Not tested');

    useEffect(() => {
        const testApiConnection = async () => {
            try {
                // Test basic API connectivity
                const response = await fetch('http://127.0.0.1:8000/api/test');
                const data = await response.json();
                setApiStatus(`✅ API Connected: ${data.message}`);
            } catch (error) {
                setApiStatus(`❌ API Connection Failed: ${error.message}`);
            }
        };

        testApiConnection();
    }, []);

    // eslint-disable-next-line no-unused-vars
    const testLogin = async () => {
        setLoginTest('Testing login...');
        try {
            const response = await api.post('/login', {
                email: 'test@example.com',
                password: 'password'
            });
            setLoginTest('✅ Login endpoint works');
            console.log('Login test response:', response.data);
            
            // Test messages endpoint after successful login
            testMessages();
        } catch (error) {
            setLoginTest(`❌ Login test failed: ${error.response?.data?.message || error.message}`);
            console.error('Login test error:', error.response?.data);
        }
    };

    const testMessages = async () => {
        setMessagesTest('Testing messages...');
        try {
            const response = await api.get('/messages');
            console.log('Messages test response:', response.data);
            console.log('Messages type:', typeof response.data);
            console.log('Messages is array:', Array.isArray(response.data));
            setMessagesTest(`✅ Messages: ${Array.isArray(response.data) ? `Array with ${response.data.length} items` : typeof response.data}`);
        } catch (error) {
            setMessagesTest(`❌ Messages test failed: ${error.response?.data?.message || error.message}`);
            console.error('Messages test error:', error.response?.data);
        }
    };

    // return (
    //     <div style={{ 
    //         position: 'fixed', 
    //         top: '10px', 
    //         right: '10px', 
    //         background: 'white', 
    //         padding: '15px', 
    //         border: '1px solid #ccc',
    //         borderRadius: '8px',
    //         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    //         zIndex: 9999,
    //         fontSize: '12px',
    //         maxWidth: '300px'
    //     }}>
    //         <h4 style={{ margin: '0 0 10px 0' }}>API Status</h4>
    //         <div style={{ marginBottom: '5px' }}>{apiStatus}</div>
    //         <div style={{ marginBottom: '5px' }}>{loginTest}</div>
    //         <div style={{ marginBottom: '10px' }}>{messagesTest}</div>
    //         <button onClick={testLogin} style={{ 
    //             padding: '5px 10px', 
    //             fontSize: '12px',
    //             cursor: 'pointer',
    //             border: '1px solid #667eea',
    //             background: '#667eea',
    //             color: 'white',
    //             borderRadius: '4px',
    //             marginRight: '5px'
    //         }}>
    //             Test Login
    //         </button>
    //         <button onClick={testMessages} style={{ 
    //             padding: '5px 10px', 
    //             fontSize: '12px',
    //             cursor: 'pointer',
    //             border: '1px solid #28a745',
    //             background: '#28a745',
    //             color: 'white',
    //             borderRadius: '4px'
    //         }}>
    //             Test Messages
    //         </button>
    //     </div>
    // );
};

export default ApiTest;

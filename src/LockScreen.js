// LockScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LockScreen.css'; // Create and style this CSS file as needed

const LockScreen = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUnlock = () => {
    if (password === '1111') {
      navigate('/'); // Navigate to the dashboard after unlocking
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="lock-screen">
      <h2>Enter Password to Unlock</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleUnlock}>Unlock</button>
    </div>
  );
};

export default LockScreen;

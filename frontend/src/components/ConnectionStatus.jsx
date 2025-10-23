// components/ConnectionStatus.jsx
import React from 'react';
import { useSocket } from '../hooks/useSocket';

const ConnectionStatus = () => {
  const { connectionStatus } = useSocket();

  if (connectionStatus.connected) {
    return (
      <div className="flex items-center space-x-2 text-green-600 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-red-600 text-sm">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span>
        Disconnected 
        {connectionStatus.reconnectAttempts > 0 && 
          ` (Attempt ${connectionStatus.reconnectAttempts})`
        }
      </span>
    </div>
  );
};

export default ConnectionStatus;
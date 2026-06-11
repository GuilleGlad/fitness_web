import { useState, useEffect } from 'react';

export function useServerStatus(pingUrl, intervalMs = 10000, setServerStatusStr) {
  const [isAlive, setIsAlive] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Use HEAD to minimize network payload
        const response = await fetch(pingUrl, { 
          method: 'HEAD',
          cache: 'no-store' // Prevent the browser from caching a "valid" response if the server goes down
        });
        
        // response.ok is true if the status code is 200-299
        setIsAlive(response.ok);
        setServerStatusStr(response.ok ? 'El servidor está online' : 'El servidor está offline');
      } catch (error) {
        // If the network request fails entirely (e.g., server is down, CORS issue)
        setIsAlive(false);
        setServerStatusStr('El servidor está offline');
      }
    };

    // Run immediately on mount
    checkStatus();

    // Set up the interval heartbeat
    const intervalId = setInterval(checkStatus, intervalMs);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [pingUrl, intervalMs]);

  return isAlive;
}
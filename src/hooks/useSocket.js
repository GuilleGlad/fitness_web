import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// URL de tu servidor Express
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL;

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inicializar conexión
    const socketInstance = io(SOCKET_SERVER_URL, {
      autoConnect: true,
    });

    // Escuchar eventos de estado de conexión
    socketInstance.on('connect', () => {
      console.log('Conectado al WebSocket con ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado del WebSocket');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup: desconectar al desmontar el componente o aplicación
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
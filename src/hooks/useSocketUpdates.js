import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/context/AuthContext';
import { socketUrl } from '../utils/apiRequestUrl';

// Optional: you can prepend http:// if socketUrl is just a domain/port
const getFormattedSocketUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `http://${url}`;
    }
    return url;
};

export const useSocketUpdates = () => {
    const queryClient = useQueryClient();
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        const url = getFormattedSocketUrl(socketUrl);
        
        const socket = io(url, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to real-time updates via Socket.IO');
        });

        // Course & Specialization updates
        socket.on('course_updated', (data) => {
            console.log('Received course update:', data);
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['specializations'] });
        });

        // School & Department updates
        socket.on('school_updated', (data) => {
            console.log('Received school update:', data);
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        });

        // Student updates
        socket.on('student_updated', (data) => {
            console.log('Received student update:', data);
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from real-time updates');
        });

        return () => {
            socket.disconnect();
        };
    }, [token, queryClient]);
};

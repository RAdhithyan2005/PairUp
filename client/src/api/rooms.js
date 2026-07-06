import api from './axios.js';

export const createRoom = () => api.post('/rooms/create');

export const getRoom = (roomId) => api.get(`/rooms/${roomId}`);

export const getRoomHistory = () => api.get('/rooms/my/history');
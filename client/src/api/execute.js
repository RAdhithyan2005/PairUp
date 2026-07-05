import api from './axios.js';

export const runCode = (language, code) =>
  api.post('/execute', { language, code });
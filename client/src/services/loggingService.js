import axios from 'axios';

const loggingApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const logMalformedResponse = async (payload) => {
  try {
    if (import.meta.env.MODE === 'development') {
      console.warn('Malformed API response logged:', payload);
      return;
    }
    await loggingApi.post('log', {
      type: 'malformed_response',
      payload,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to send malformed response to logging endpoint:', e);
  }
};

export default { logMalformedResponse };

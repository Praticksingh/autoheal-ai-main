const isProduction = import.meta.env.PROD;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isProduction ? 'https://api.autoheal.ai' : 'http://localhost:5000');

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE_URL;
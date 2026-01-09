// API Configuration
// In Docker, frontend connects to backend via service name
// But browser connects via localhost (port mapping)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
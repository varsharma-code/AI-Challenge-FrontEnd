// src/services/api.ts
import axios from 'axios'; // Assuming you are using axios for HTTP requests

const API_BASE_URL = 'http://localhost:3000/api'; // Define your base API URL

export const fetchThreats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/threats/getAllThreats`);
    // Assuming your backend returns { threats: Threat[], total: number, lastUpdated: string }
    return response.data;
  } catch (error) {
    console.error('Error fetching threats:', error);
    throw error; // Re-throw the error so react-query can handle it
  }
};

// You might also have other API functions here
// export const createThreat = async (newThreatData: any) => { ... };
const API_BASE_URL = 'http://localhost:3000';

export const fetchThreats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/threats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    

    const data = await response.json();
    console.log('Data is',data)
    return data;
  } catch (error) {
    console.error('Error fetching threats:', error);
    throw error;
  }
};

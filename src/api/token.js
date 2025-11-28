// JWT Utility Functions
export function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function getCurrentUserEmail() {
  const token = localStorage.getItem('authToken');
  const decoded = decodeToken(token);
  return decoded?.sub || null;
}

export function getCurrentUserId() {
  return null; // Implement if needed
}

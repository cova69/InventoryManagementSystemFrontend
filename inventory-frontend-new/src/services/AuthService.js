import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
  login(email, password) {
    return axios
      .post(API_URL + 'login', {
        email,
        password
      })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(name, email, password, role) {
    return axios.post(API_URL + 'register', {
      name,
      email,
      password,
      role
    });
  }

  isTokenExpired(token) {
    try {
      // Decode the token (JWT is in format: header.payload.signature)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Check if the token is expired
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (e) {
      console.error("Error checking token expiration:", e);
      return true; // If there's an error parsing, consider token expired
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Check if token is expired
    if (user && user.token && this.isTokenExpired(user.token)) {
      console.log("Token expired, logging out");
      localStorage.removeItem('user');
      return null;
    }
    return user;
  }

  getToken() {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  getAuthHeader() {
    const token = this.getToken();
    if (token) {
      return { Authorization: 'Bearer ' + token }; // for Spring Boot back-end
    } else {
      return {};
    }
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user || !Array.isArray(user.roles)) return false;
    
    // Check for both formats of the role (with and without ROLE_ prefix)
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
  }

  isAdmin() {
    return this.hasRole('ADMIN');
  }

  isManager() {
    return this.hasRole('MANAGER') || this.hasRole('ADMIN');
  }

  isEmployee() {
    return this.hasRole('EMPLOYEE') || this.hasRole('MANAGER') || this.hasRole('ADMIN');
  }
}

export default new AuthService();
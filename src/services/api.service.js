export class ApiService {
    async apiRequest(url, body = undefined, method = 'GET', email = localStorage.getItem('email'), password = localStorage.getItem('password')) {
        const options = { method };
        options.headers = {
          'Content-Type': 'application/json',
          'authorization': 'Basic ' + btoa(`${email}:${password}`),
        };
    
        if (body) {
          options.body = JSON.stringify(body);
        }
    
        const response = await fetch(`http://localhost:3000/api/${url}`, options);
    
        if (response.ok) {
          if (response.status === 204) {
            return;
          }
          return await response.json();
        }
    
        const errorText = await response.text();
        console.error('Error in ApiService:', response.status, errorText);
        throw new Error(errorText);
      }

      async createUser(email, username, password) {
        return await this.apiRequest('users', { email, username, password }, 'POST');
      }

      async authenticateUser(email, password) {
        return await this.apiRequest('users', undefined, 'GET', email, password);
      }

      async getUser(userId) {
        return await this.apiRequest(`users/${userId}`);
      }
}
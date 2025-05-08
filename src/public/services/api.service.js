export class ApiService {
  async apiRequest(url, body = undefined, method, username = localStorage.getItem('username'), password = localStorage.getItem('password')) {
    const options = { method };
    options.headers = {
      'Content-Type': 'application/json',
      'authorization': 'Basic ' + btoa(`${username}:${password}`),
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

  // User-related API methods
  async createUser(username, password) {
    return await this.apiRequest('users', { username, password }, 'POST');
  }

  async authenticateUser(username, password) {
    return await this.apiRequest('users', undefined, 'GET', username, password);
  }

  async getUser(userId) {
    return await this.apiRequest(`users/${userId}`);
  }

  async deleteUser(userId, username, password) {
    return await this.apiRequest(`users/${userId}`, undefined, 'DELETE', username, password);
  }

  // Sudoku-related API methods
  async getAllSudokus(username, password) {
    return await this.apiRequest('sudoku', undefined, 'GET', username, password);
  }

  async getSudokuById(sudokuId) {
    return await this.apiRequest(`sudoku/${sudokuId}`);
  }

  async createSudoku(sudokuData) {
    return await this.apiRequest('sudoku', sudokuData, 'POST');
  }

  async updateSudoku(sudokuData) {
    const sudokuId = sudokuData._id
    return await this.apiRequest(`sudoku/${sudokuId}`, sudokuData, 'PUT');
  }

  async deleteSudoku(sudokuId) {
    return await this.apiRequest(`sudoku/${sudokuId}`, undefined, 'DELETE');
  }
}
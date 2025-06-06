import { ApiService } from './services/api.service.js';

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const login = new Login();
    login.authenticateUser(username, password);
});
const usernameError = document.getElementById('usernameError');

if (localStorage.getItem("username") != null) {
    window.location.href = '/';
}

export class Login {
    async authenticateUser(username, password) {
        const apiService = new ApiService();
        try {
            const response = await apiService.authenticateUser(username, password);
            if (response) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                localStorage.setItem('id', response._id);
                window.location.href = '/';
                console.log('User logged in successfully:', response);
                return true;
            }
        } catch (error) {
            usernameError.textContent = 'Error at Login: ' + error.message;
            usernameError.classList.add('visible');
        }
        return false;
    }
}
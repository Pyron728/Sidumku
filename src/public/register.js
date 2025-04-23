import { ApiService } from './services/api.service.js';

document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const register = new Register();
    register.registerUser(username, password);
});

export class Register {
    async registerUser(username, password) {
        const apiService = new ApiService();
        try {
            const response = await apiService.createUser(username, password);
            if (response) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                // + auth service
                window.location.href = '/';
                console.log('User registered successfully:', response);
                return true;
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
        return false;
    }
}
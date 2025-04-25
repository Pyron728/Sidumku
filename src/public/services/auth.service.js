export class AuthService {
    isLoggedIn() {
        return localStorage.getItem('username') !== null && localStorage.getItem('password') !== null;
    }

    logOut() {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('id');
        console.log('User logged out successfully');
        window.location.href = '/';
    }
}
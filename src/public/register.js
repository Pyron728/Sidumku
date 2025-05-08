import { ApiService } from './services/api.service.js';

document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const register = new Register();
    register.registerUser(username, password);
});
const usernameError = document.getElementById('usernameError');

if (localStorage.getItem("username") != null) {
    window.location.href = '/';
}

export class Register {
    async registerUser(username, password) {
        const apiService = new ApiService();
        try {
            const response = await apiService.createUser(username, password);
            if (response) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                localStorage.setItem('id', response._id);
                window.location.href = '/';
                console.log('User registered successfully:', response);
                return true;
            }
        } catch (error) {
            usernameError.textContent = 'Error when registrating: A user with this name already exists';
            usernameError.classList.add('visible');
        }
        return false;
    }
}

const agbText = document.getElementById('agbText');
const spinner = document.getElementById('spinnerPopup');

let isJapanese = false;

const translations = {
    de: {
        'Registrierung': 'Registrierung',
        'Benutzername': 'Benutzername',
        'Passwort': 'Passwort',
        'Registrieren': 'Registrieren',
        'Du hast bereits einen Account?': 'Du hast bereits einen Account?',
        'Login': 'Login',
        'Ich stimme den AGB zu': 'Ich stimme den AGB zu',
        'Sidumku': 'Sidumku'
    },
    ja: {
        'Registrierung': '登録',
        'Benutzername': 'ユーザー名',
        'Passwort': 'パスワード',
        'Registrieren': '登録する',
        'Du hast bereits einen Account?': 'すでにアカウントをお持ちですか？',
        'Login': 'ログイン',
        'Ich stimme den AGB zu': '利用規約に同意します',
        'Sidumku': 'しどぅむく'
    }
};

function translatePage(toLang) {
    document.querySelector('h2').textContent = translations[toLang]['Registrierung'];
    document.getElementById('username').placeholder = translations[toLang]['Benutzername'];
    document.getElementById('password').placeholder = translations[toLang]['Passwort'];
    document.getElementById('title').textContent = translations[toLang]['Sidumku'];
    document.querySelector('button[type="submit"]').textContent = translations[toLang]['Registrieren'];
    document.getElementById('login').innerHTML = `${translations[toLang]['Du hast bereits einen Account?']} <a href="/login">${translations[toLang]['Login']}</a>`;    document.querySelector('form p a').textContent = translations[toLang]['Login'];
    document.getElementById('agbText').textContent = translations[toLang]['Ich stimme den AGB zu'];
}

agbText.addEventListener('click', () => {
    spinner.classList.remove('hidden');
    setTimeout(() => {
        isJapanese = !isJapanese;
        translatePage(isJapanese ? 'ja' : 'de');
        spinner.classList.add('hidden');
    }, 4000);
});
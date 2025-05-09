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
    en: {
        'Registration': 'Registration',
        'username': 'username',
        'password': 'password',
        'Register': 'Register',
        'Already have an account?': 'Already have an account?',
        'Login': 'Login',
        "I'm not a robot": "I'm not a robot",
        'Sidumku': 'Sidumku'
    },
    ja: {
        'Registration': '登録',
        'username': 'ユーザー名',
        'password': 'パスワード',
        'Register': '登録する',
        'Already have an account?': 'すでにアカウントをお持ちですか？',
        'Login': 'ログイン',
        "I'm not a robot": '私はロボットではありません',
        'Sidumku': 'しどぅむく'
    }
};

function translatePage(toLang) {
    document.querySelector('h2').textContent = translations[toLang]['Registration'];
    document.getElementById('username').placeholder = translations[toLang]['username'];
    document.getElementById('password').placeholder = translations[toLang]['password'];
    document.getElementById('title').textContent = translations[toLang]['Sidumku'];
    document.querySelector('button[type="submit"]').textContent = translations[toLang]['Register'];
    document.getElementById('login').innerHTML = `${translations[toLang]['Already have an account?']} <a href="/login">${translations[toLang]['Login']}</a>`;    document.querySelector('form p a').textContent = translations[toLang]['Login'];
    document.getElementById('agbText').textContent = translations[toLang]["I'm not a robot"];
}

agbText.addEventListener('click', () => {
    spinner.classList.remove('hidden');
    setTimeout(() => {
        isJapanese = !isJapanese;
        translatePage(isJapanese ? 'ja' : 'en');
        spinner.classList.add('hidden');
    }, 4000);
});
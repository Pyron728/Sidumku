import { ApiService } from './services/api.service.js';
import { AuthService } from './services/auth.service.js';

export class Header {

    logout() {
        const authService = new AuthService();
        authService.logOut();
    }

    deleteAccount() {
        const apiService = new ApiService();
        const authService = new AuthService();

        if (confirm("Bist du sicher, dass du deinen Account löschen möchtest?")) {
            apiService.deleteUser(
                localStorage.getItem("id"),
                localStorage.getItem("username"),
                localStorage.getItem("password")
            );
            authService.logOut();
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        alert("Fehlt noch...");
    }
}

    const header = document.getElementById("header");

    const username = (localStorage.getItem("username") || "").trim().toLowerCase();
    const isLoggedIn = username !== "";

    window.headerClass = new Header();

    header.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #FFFAED;
            font-family: 'Nunito', sans-serif;
            margin: 0;
            padding: 0;
            color: #32383C;
        }

        #header {
            padding: 12px 24px;
            border-bottom: 1px solid #DACDAA;
        }

        #dropdown {
            background: #FAEDD6;
            border: 1px solid #DACDAA;
            border-radius: 10px;
            overflow: hidden;
            z-index: 100;
            width: 180px;
            box-shadow: 0 4px 8px rgba(50, 56, 60, 0.2);
            position: absolute;
            right: 0;
            top: 48px;
        }

        .dropdown-item {
            padding: 12px 16px;
            color: #32383C;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .dropdown-item:hover {
            background: #DACDAA;
        }

        .dropdown-divider {
            height: 1px;
            background: #DACDAA;
            margin: 6px 0;
        }

        #avatar {
            background: #FFF;
            color: #32383C;
            width: 40px;
            height: 40px;
            border: 1.5px solid #DACDAA;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }

        #avatar:hover {
            background-color: #DACDAA;
        }

        button {
            background-color: #FAEDD6;
            font-family: 'Nunito', sans-serif;
            color: #32383C;
            padding: 8px 16px;
            font-size: 16px;
            font-weight: 600;
            margin-right: 0.5rem;
            border: 1.5px solid #DACDAA;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        button:hover {
            background-color: #DACDAA;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        #header a span {
            color: #32383C;
        }
    </style>

    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
            <img src="assets/cow.png" alt="Logo" style="height: 32px;">
            <span style="font-size: 20px; font-weight: 700;">Sidumku</span>
        </a>
        <div id="header-right" style="position: relative;">
            ${isLoggedIn ? `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button onclick="window.dispatchEvent(new Event('newGame'))">Neues Spiel</button>
                    <button onclick="window.dispatchEvent(new Event('togglePause'))">Pausiert</button>
                    <div id="avatar">
                        ${username.charAt(0).toUpperCase()}
                    </div>
                    <div id="dropdown" style="display: none;">
                        <div class="dropdown-item" onclick="window.location.href='/profile'">Profil</div>
                        <div class="dropdown-item" onclick="headerClass.toggleDarkMode()">Dark Mode</div>
                        <div class="dropdown-item" onclick="headerClass.logout()">Logout</div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" onclick="headerClass.deleteAccount()">Account löschen</div>
                    </div>
                </div>
            ` : `
                <button onclick="window.location.href = '/login'">Login</button>
            `}
        </div>
    </div>
    `;

    if (isLoggedIn) {
        const avatar = document.getElementById("avatar");
        const dropdown = document.getElementById("dropdown");

        avatar.addEventListener("click", () => {
            dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
        });

        document.addEventListener("click", (e) => {
            if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });
    }

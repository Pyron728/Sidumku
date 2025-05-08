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
    
        apiService.deleteUser(
            localStorage.getItem("id"),
            localStorage.getItem("username"),
            localStorage.getItem("password")
        );
        authService.logOut();
    }

    toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        alert("Fehlt noch...");
    }

    showDeleteModal() {
        if (document.getElementById("delete-modal")) return;
    
        const modal = document.createElement("div");
        modal.id = "delete-modal";
        modal.innerHTML = `
            <div id="modal-backdrop" style="
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background-color: rgba(50, 56, 60, 0.4);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                pointer-events: all;
            ">
                <div id="modal-content" style="
                    background: #FFFAED;
                    border: 1px solid #DACDAA;
                    border-radius: 16px;
                    padding: 24px;
                    width: 300px;
                    text-align: center;
                    font-family: 'Nunito', sans-serif;
                    box-shadow: 0 8px 24px rgba(50, 56, 60, 0.2);
                    animation: fadeIn 0.3s ease;
                    pointer-events: auto;
                ">
                    <h3 style="margin-bottom: 12px; font-size: 20px;">Are you sure?</h3>
                    <p style="margin-bottom: 20px; font-size: 16px;">Do you really want to delete your account?</p>
                    <div style="display: flex; gap: 8px;">
                        <button id="cancel-delete" style="flex: 1;">Cancel</button>
                        <button id="confirm-delete" style="flex: 1; background-color: #E07A5F; border-color: #E07A5F; color: white;">Yes, delete</button>
                    </div>
                </div>
            </div>
        `;
    
        document.body.appendChild(modal);
        document.body.style.overflow = "hidden";
    
        const backdrop = document.getElementById("modal-backdrop");
        const content = document.getElementById("modal-content");
    
        backdrop.addEventListener("click", (e) => {
            if (!content.contains(e.target)) {
                modal.remove();
                document.body.style.overflow = "";
            }
        });
    
        document.getElementById("cancel-delete").onclick = () => {
            modal.remove();
            document.body.style.overflow = "";
        };
    
        document.getElementById("confirm-delete").onclick = () => {
            this.deleteAccount();
            modal.remove();
            document.body.style.overflow = "";
        };
    }
}

const header = document.getElementById("header");
const username = (localStorage.getItem("username") || "").trim().toLowerCase();
const isLoggedIn = username !== "";
const isLoginPage = window.location.pathname === "/login";
const isRegisterPage = window.location.pathname === "/register";
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
        border: 1.5px solid #DACDAA;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin: 2px;
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

    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }

    .header-buttons {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: nowrap;
    }
</style>

<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
        <img src="assets/cow.png" alt="Logo" style="height: 32px;">
        <span style="font-size: 20px; font-weight: 700;">Sidumku</span>
    </a>
    <div id="header-right" style="position: relative;">
        ${isLoggedIn ? `
            <div class="header-buttons">
                <button onclick="window.location.href='/'">Home</button>
                <div id="avatar">${username.charAt(0).toUpperCase()}</div>
                <div id="dropdown" style="display: none;">
                    <div class="dropdown-item" onclick="window.location.href='/profile'">Profile</div>
                    <div class="dropdown-item" onclick="headerClass.toggleDarkMode()">Dark Mode</div>
                    <div class="dropdown-item" onclick="headerClass.logout()">Logout</div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" onclick="headerClass.showDeleteModal()">Delete Account</div>                    
                </div>
            </div>
        ` : `
            <div class="header-buttons">
                <button onclick="window.location.href='/'">Home</button>
                ${
                    isLoginPage
                        ? `<button onclick="window.location.href='/register'">Register</button>`
                        : isRegisterPage
                            ? `<button onclick="window.location.href='/login'">Login</button>`
                            : `<button onclick="window.location.href='/login'">Login</button>`
                }
            </div>
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
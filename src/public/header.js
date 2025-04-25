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
        apiService.deleteUser(localStorage.getItem("id"), localStorage.getItem("username"), localStorage.getItem("password"));
        authService.logOut();
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        alert("Fehlt noch...");
    }  
}

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");

    const username = (localStorage.getItem("username") || "").trim().toLowerCase();
    const isLoggedIn = username !== "";

    window.headerClass = new Header();

    header.innerHTML = `
      <style>
        #dropdown {
          background: #32383c;
          border: 1px solid #444;
          border-radius: 6px;
          overflow: hidden;
          z-index: 100;
          width: 160px;
        }
        .dropdown-item {
          padding: 10px 15px;
          color: white;
          cursor: pointer;
          transition: background 0.2s ease, opacity 0.2s ease;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .dropdown-divider {
          height: 1px;
          background: #555;
          margin: 5px 0;
        }
      </style>
  
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <img src="assets/cow.png" alt="Logo" style="height: 32px;">
            <span style="font-size: 20px; font-weight: 700; color: white;">Sidumku</span>
        </div>
        <div id="header-right" style="position: relative;">
          ${isLoggedIn ? `
            <div id="avatar" style="background: #fff; color: #111; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 700; cursor: pointer;">
              ${username.charAt(0).toUpperCase()}
            </div>
            <div id="dropdown" style="display: none; position: absolute; right: 0; top: 48px;">
              <div class="dropdown-item" onclick="window.location.href='/profile'">Profil</div>
              <div class="dropdown-item" onclick="headerClass.toggleDarkMode()">Dark Mode</div>
              <div class="dropdown-item" onclick="headerClass.logout()">Logout</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" onclick="headerClass.deleteAccount()">Account löschen</div>
            </div>
          ` : `
            <button onclick="window.location.href = '/login'" style="padding: 8px 16px; font-size: 16px; background: white; color: #111; border: none; border-radius: 5px; cursor: pointer;">Login</button>
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
  });
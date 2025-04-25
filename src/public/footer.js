    const footer = document.createElement("footer");
    footer.id = "footer";
    footer.innerText = "© 2025 Sidumku – Patrick, Danilo & Nico. Alle Rechte vorbehalten.";
    document.body.appendChild(footer);

    const style = document.createElement("style");
    style.innerHTML = `
        #footer {
            text-align: center;
            padding: 16px 0;
            font-family: 'Nunito', sans-serif;
            font-size: 12px;
            color: #32383C;
            background-color: #FFFAED;
        }
    `;
    document.head.appendChild(style);
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import userRoutes from './controllers/user_controller.js';
import sudokuRoutes from './controllers/sudoku_controller.js';

const app = express();
const PORT = 3000;

// __dirname erzeugen (weil ESModules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade definieren
const rootPath = path.join(__dirname, '..');               // Projekt-Wurzelverzeichnis
const publicPath = path.join(__dirname, 'public');         // HTML-Seiten wie /register etc.

// Middleware
app.use(cors());
app.use(express.json());

// 🟢 Statische Dateien ausliefern:
// - /index.html
// - /phaser.js
// - /main.js
// - /assets/...
app.use(express.static(rootPath));               // Wurzel (für Spiel-HTML + JS)
app.use('/assets', express.static(path.join(rootPath, 'assets'))); // Bilder etc.
app.use(express.static(publicPath));             // Für /register.html etc.

// 🔌 API-Routen
app.use('/api/users', userRoutes);
app.use('/api/sudoku', sudokuRoutes);

// 🌐 HTML-Routen
app.get('/', (req, res) => {
  res.sendFile(path.join(rootPath, 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(publicPath, 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(publicPath, 'login.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(publicPath, 'profile.html'));
});

// 🚀 Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter: http://localhost:${PORT}`);
});
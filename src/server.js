import express from 'express';
import path from 'path';
import cors from 'cors'
import { fileURLToPath } from 'url';
import userRoutes from './controllers/user_controller.js';
import sudokuRoutes from './controllers/sudoku_controller.js'

const app = express();
const PORT = 3000;

// __dirname in ES-Module simulieren (da wir "type": "module" in package.json haben)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware zum Parsen von JSON
app.use(express.json());

// Add CORS middleware
app.use(cors());

// Statische Dateien aus dem "public" Ordner ausliefern (Phaser, HTML, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API-Routen einbinden
app.use('/api/users', userRoutes);
app.use('/api/sudoku', sudokuRoutes);

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf: http://localhost:${PORT}`);
});
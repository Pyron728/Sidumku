import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './controllers/user.js';

const app = express();
const PORT = 3000;

// __dirname in ES-Module simulieren (da wir "type": "module" in package.json haben)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware zum Parsen von JSON
app.use(express.json());

// Statische Dateien aus dem "public" Ordner ausliefern (Phaser, HTML, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API-Routen einbinden
app.use('/api/users', userRoutes);

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf: http://localhost:${PORT}`);
});
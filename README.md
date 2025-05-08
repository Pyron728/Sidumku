# Sidumku Sudoku Game - README
Dies ist die Dokumentation zum Entwickeln/Starten des Spiels Sidumku.

## Mady by
- Patrick 
- Nico
- Danilo

### 0. Vorraussetzungen
- Node.js (mind. Version 14) muss installiert sein. [Node.js](https://nodejs.org/)
- Git muss installiert sein. [Git for Windows](https://git-scm.com/downloads/win)

### 1. Projekt klonen (GitExtensions empfohlen)
- Falls das Projekt in einem Git-Repository liegt, klone es mit:
```sh
git clone https://github.com/Pyron728/Sidumku.git
```

- Navigiere in den Projektordner:
```sh
cd <DEIN_PROJEKT_PFAD>
```

### 2. Abhängigkeiten installieren
- Installiere die npm-Abhängigkeiten mit

```sh
npm install
```

### 3. Spiel starten
-  gehe im Terminal auf die `\sidumku\src` Ebene.

-  Starte den Server mit:
```sh
node server.js
```
- Nach dem Start erscheint eine Ausgabe wie:
```
nicoamann@Nico-MacBookAir src % node server.js
✅ Server läuft auf: http://localhost:3000
```

- Backend kann über UI oder Insomnia getestet werden
- In der IDE erscheint `user.db` und `sudoku.db`, in der die Daten lokal gespeichert werden
- Falls die Datebank gelöscht werden soll:
```sh
rm user.db
```

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

## 3.1 Mit dem Phaser Launcher starten:
- Installiere den [Phaser Launcher](https://phaser.io/download/phaser-launcher)
- Registrier dich bei Phaser und logge dich damit ein
- Gehe auf der Startpage rechts auf Projects und importiere das vorher geklonte Projekt 
- Öffne das Projekt und klicke oben auf das Play-Symbol 

## 3.2 Ohne dem Phaser Launcher starten:
- Phaser benötigt einen Webserver, da moderne Browser `file://`-Zugriffe oft blockieren. Dies macht der Phaser Launcher automatisch. Wir nutzen das npm package `http-server`. 

- Starte den Server mit:
```sh
npx http-server .
```
- Nach dem Start erscheint eine Ausgabe wie:
```
Starting up http-server, serving ./
Available on:
  http://localhost:8080
```
- Öffne nun [http://localhost:8080](http://localhost:8080) im Browser
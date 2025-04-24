import { SudokuScene } from "./public/scenes/Sudoku.js";
import { MainMenuScene } from "./public/scenes/MainMenu.js";

const config = {
    type: Phaser.AUTO,
    width: 1280, // logische Breite
    height: 720, // logische Höhe
    resolution: window.devicePixelRatio || 1, // HiDPI-Unterstützung
    scene: [MainMenuScene, SudokuScene],
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        antialias: true,     // glättet Text & Vektor-Kanten
        pixelArt: false,     // wichtig: false für moderne UIs
        roundPixels: false   // kann für Buttons true oder false sein
    }
};

const game = new Phaser.Game(config);
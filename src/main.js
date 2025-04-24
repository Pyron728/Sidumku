import { SudokuScene } from "./public/scenes/Sudoku.js";
import { MainMenuScene } from "./public/scenes/MainMenu.js";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    resolution: 2,
    scene: [MainMenuScene, SudokuScene],
    scale: {
        mode: Phaser.Scale.FIT, // ENVELOP kann Unschärfe verursachen
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    }
};

const game = new Phaser.Game(config);
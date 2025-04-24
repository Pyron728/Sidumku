import {SudokuScene} from "./public/scenes/Sudoku.js";
import {MainMenuScene} from "./public/scenes/MainMenu.js";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: [MainMenuScene, SudokuScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
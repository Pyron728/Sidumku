import { SudokuScene } from "./public/scenes/Sudoku.js";
import { MainMenuScene } from "./public/scenes/MainMenu.js";
import DifficultyScene from "./public/scenes/Difficulty.js";
import {PausedGames} from "./public/scenes/PausedGames.js";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720, 
    resolution: 2,
    parent: 'game-container',
    scene: [MainMenuScene, SudokuScene, DifficultyScene, PausedGames],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1,
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    }
};

const game = new Phaser.Game(config);
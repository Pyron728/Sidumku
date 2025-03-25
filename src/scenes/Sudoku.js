
import { generateSudoku } from '../generator/BasicSudokuGenerator.js';

class SudokuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SudokuScene' });
        this.board = [];
        this.selectedCell = null;
        this.cellSize = 60;
        this.grid = [];
        this.padding = 50;
        this.numberPadX = 380;
        this.numberPadY = 100;
    }

    preload() {
        // preload für Bilddaten und so shit
    }

    create() {
        const puzzle = generateSudoku('medium');  // You can change difficulty here
        this.board = puzzle.currentBoard;

        this.createGrid();
        this.createUI();
    }

    createGrid() {
        const gridX = (this.scale.width - (9 * this.cellSize + 4 * 4)) / 2; // Adding extra padding for thick lines
        const gridY = (this.scale.height - (9 * this.cellSize + 4 * 4)) / 2;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.board[row][col];

                // Add extra spacing for subgrid separators
                const extraX = Math.floor(col / 3) * 4; // Extra space after every 3 columns
                const extraY = Math.floor(row / 3) * 4; // Extra space after every 3 rows

                const x = gridX + col * this.cellSize + extraX;
                const y = gridY + row * this.cellSize + extraY;

                const cellRect = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0xCCCCCC);
                cellRect.setStrokeStyle(2, 0x000000); // Normal cell border
                cellRect.setInteractive();

                cellRect.on('pointerover', () => cellRect.setAlpha(0.5));
                cellRect.on('pointerout', () => cellRect.setAlpha(1));
                cellRect.on('pointerdown', () => {
                    if (cell.value === null) {
                        this.selectedCell = { row, col };
                    }
                });

                const text = this.add.text(x, y, cell.value ? cell.value.toString() : '', {
                    fontSize: '24px',
                    color: cell.value ? '#000' : '#AAA',
                    fontStyle: cell.isGiven ? 'bold' : 'normal'
                }).setOrigin(0.5);

                this.grid.push({ cellRect, text, cell });
            }
        }

        this.gridX = gridX;
        this.gridY = gridY;
    }

    createUI() {
        const numbers = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9']
        ];

        this.numberPadX = this.gridX + 9 * this.cellSize + 40; // Adjusted for new grid width
        this.numberPadY = this.gridY + (9 * this.cellSize - (3 * (this.cellSize + 10))) / 2;

        numbers.forEach((row, rowIndex) => {
            row.forEach((button, colIndex) => {
                const x = this.numberPadX + colIndex * (this.cellSize + 10);
                const y = this.numberPadY + rowIndex * (this.cellSize + 10);

                const numberButton = this.add.text(x, y, button, {
                    fontSize: '32px',
                    color: '#000',
                    backgroundColor: '#DDD',
                    padding: { x: 10, y: 10 },
                    borderRadius: 5
                }).setOrigin(0.5).setInteractive();

                // Darken on hover
                numberButton.on('pointerover', () => {
                    numberButton.setStyle({ backgroundColor: '#AAA' });
                });

                numberButton.on('pointerout', () => {
                    numberButton.setStyle({ backgroundColor: '#DDD' });
                });

                numberButton.on('pointerdown', () => {
                    if (this.selectedCell) {
                        const { row, col } = this.selectedCell;
                        if (this.board[row][col].value === null) {
                            this.board[row][col].value = parseInt(button);
                            this.updateGrid();
                        }
                    }
                });
            });
        });
    }

    updateGrid() {
        this.grid.forEach(({ cellRect, text, cell }) => {
            if (cell.value !== null) {
                text.setText(cell.value.toString());
                text.setColor(cell.isGiven ? '#000' : '#00F');
            } else {
                text.setText('');
            }
        });
    }

    update() {
        // You can add any dynamic updates here (like checking for solved state)
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scene: SudokuScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

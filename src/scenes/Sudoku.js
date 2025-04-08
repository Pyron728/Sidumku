
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
        const puzzle = generateSudoku('medium');
        this.board = puzzle.currentBoard;
        this.solution = puzzle.solvedBoard;
        this.createGrid();
        this.createUI();
        this.input.keyboard.on('keydown', (event) => {
            if (this.selectedCell != null && /^[1-9]$/.test(event.key)) {
                const { row, col } = this.selectedCell; 
                this.insertNumber(row, col, parseInt(event.key));
            }
        });
    }

    createGrid() {
        const gridX = (this.scale.width - (9 * this.cellSize + 4 * 4)) / 2;
        const gridY = (this.scale.height - (9 * this.cellSize + 4 * 4)) / 2;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.board[row][col];

                const extraX = Math.floor(col / 3) * 4;
                const extraY = Math.floor(row / 3) * 4;

                const x = gridX + col * this.cellSize + extraX;
                const y = gridY + row * this.cellSize + extraY;

                const cellRect = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0xCCCCCC);
                cellRect.setStrokeStyle(2, 0x000000);
                cellRect.setInteractive();

                cellRect.on('pointerover', () => cellRect.setAlpha(0.5));
                cellRect.on('pointerout', () => cellRect.setAlpha(1));
                cellRect.on('pointerdown', () => {
                    this.selectedCell = { row, col };
                    this.highlightSelection(row, col);
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

        this.numberPadX = this.gridX + 9 * this.cellSize + 40;
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

    insertNumber(row, col, number) {
        if (!this.board[row][col].isGiven) {
            if (this.solution[row][col].value === number) {
                this.board[row][col].value = number;
                this.updateGrid();
                this.saveSudoku();
                this.highlightSelection(row, col);
            }
            else {
                console.log("Wrong Number");
                // Errorhandling (part of another Userstory)
            }
        }
    }
    highlightSelection(row, col) {
        const selectedValue = this.board[row][col].value;
        
        this.grid.forEach(({ cellRect }) => {
            cellRect.setFillStyle(0xCCCCCC);
        });

        this.grid.forEach(({ cellRect, cell }, index) => {
            const gridRow = Math.floor(index / 9);
            const gridCol = index % 9;

            if (gridRow === row || gridCol === col) {
                cellRect.setFillStyle(0x999999);
            }

            if (cell.value !== null && cell.value === selectedValue) {
                cellRect.setFillStyle(0xBBBB44);
            }
        });

        const selectedCell = this.grid[row * 9 + col];
        selectedCell.cellRect.setFillStyle(0xBBBB44)
        this.selectedCell = { row, col };
    }


    update() {
        // ???
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

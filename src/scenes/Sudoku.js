import { generateSudoku } from '../generator/BasicSudokuGenerator.js';
import { ApiService } from '../services/api.service.js';

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

        // Updated colors based on the provided palette
        this.primaryColor = 0xFFFAED;      // Background color
        this.secondaryColor = 0xFAEDD6;    // Buttons, nav bar, cross line when clicking on a number
        this.tertiaryColor = 0xDACDAA;     // Borders, hover states, separations
        this.textColor = 0x32383C;         // Text, icons, thick grid lines
        this.accentColor = 0xA6A197;       
        this.highlightColor = 0xF6D4D2;    // Hints, highlighting same numbers

        // Specialized highlight colors
        this.highlightMatchingNumber = this.highlightColor;
        this.highlightSameRowAndLine = this.tertiaryColor;
        this.cellBackgroundColor = this.primaryColor;
        this.strokeColor = this.textColor;
        this.newNumberColor =  'blue' 
    }

    preload() {
        // preload für Bilddaten und so shit
    }

    create() {
        this.cameras.main.setBackgroundColor(this.primaryColor);
        this.apiService = new ApiService();
        this.puzzle = generateSudoku('medium');
        this.board = this.puzzle.currentBoard;
        this.solution = this.puzzle.solvedBoard;
        this.createGrid();
        this.createUI();
        this.input.keyboard.on('keydown', (event) => {
            if (this.selectedCell != null && /^[1-9]$/.test(event.key)) {
                const { row, col } = this.selectedCell; 
                this.insertNumber(row, col, parseInt(event.key));
            }
        });
        this.createSudokuInDb(this.puzzle)
    }

    createGrid() {
        const strokeWidth = 2
        const gridX = (this.scale.width - (9 * this.cellSize + 4 * 4)) / 2;
        const gridY = (this.scale.height - (9 * this.cellSize + 4 * 4)) / 2;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.board[row][col];

                const extraX = Math.floor(col / 3) * 4;
                const extraY = Math.floor(row / 3) * 4;

                const x = gridX + col * this.cellSize + extraX;
                const y = gridY + row * this.cellSize + extraY;

                 const cellRect = this.add.rectangle(x, y, this.cellSize, this.cellSize, this.cellBackgroundColor);
                cellRect.setStrokeStyle(strokeWidth, this.strokeColor);
                cellRect.setInteractive();
                
                cellRect.on('pointerover', () => {
                    if(cellRect.fillColor == this.cellBackgroundColor){
                        cellRect.savedColor = cellRect.fillColor;
                        cellRect.setFillStyle(this.tertiaryColor);
                    }
                });

                cellRect.on('pointerout', () => {
                    if(cellRect.fillColor != this.highlightColor)
                        cellRect.setFillStyle(cellRect.savedColor || this.cellBackgroundColor);
                });
                
                cellRect.on('pointerdown', () => {
                    this.selectedCell = { row, col };
                    this.highlightSelection(row, col);
                });

                const textColor = cell.isGiven ? this.textColor : this.newNumberColor;
                
                const text = this.add.text(x, y, cell.value ? cell.value.toString() : '', {
                    fontSize: '24px',
                    color: cell.isGiven ? textColor: this.newNumberColor,
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                this.grid.push({ cellRect, text, cell, row, col });
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
                const radius = 10;

                const buttonBg = this.add.graphics();
                buttonBg.x = x;
                buttonBg.y = y;

                const drawButton = (fillColor) => {
                    buttonBg.clear();
                    buttonBg.fillStyle(fillColor, 1);
                    buttonBg.lineStyle(2, this.tertiaryColor);
                    buttonBg.fillRoundedRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, radius);
                    buttonBg.strokeRoundedRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, radius);
                };

                drawButton(this.secondaryColor);

                const hitArea = new Phaser.Geom.Rectangle(
                    -this.cellSize / 2,
                    -this.cellSize / 2,
                    this.cellSize,
                    this.cellSize
                );
                buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

                this.add.text(x, y, button, {
                    fontFamily: 'Bold', 
                    fontSize: '32px',
                    color: this.textColor,
                }).setOrigin(0.5);

                buttonBg.on('pointerover', () => drawButton(this.tertiaryColor));
                buttonBg.on('pointerout', () => drawButton(this.secondaryColor));

                buttonBg.on('pointerdown', () => {
                    if (this.selectedCell) {
                        const { row, col } = this.selectedCell;
                        this.insertNumber(row, col, parseInt(button));
                    }
                });
            });
        });
    }

    updateGrid() {
        this.grid.forEach(({ cellRect, text, cell }) => {
            if (cell.value !== null) {
                text.setText(cell.value.toString());
                const textColor = cell.isGiven ? this.textColor : this.newNumberColor;
                text.setColor(textColor);
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
                // simple Errorhandling (complex errorhandling is part of another Userstory)
                const cellRect = this.grid.find(c => c.row === row && c.col === col).cellRect;
                cellRect.setFillStyle(0xff6666);
                this.time.delayedCall(500, () => {
                    cellRect.setFillStyle(this.highlightColor);
                });
            }
        }
    }

     async saveSudoku() {
        this.puzzle.currentBoard = this.board;
        const savedGame = await this.apiService.updateSudoku(this.puzzle);
        console.log(savedGame ? 'saved Game successfully': ('Error while saving game: ' + savedGame));
    }

    async createSudokuInDb(sudoku) {
        const savedGame = await this.apiService.createSudoku(sudoku);
        console.log(savedGame ? 'Created Game in Database for the first time': ('Error while creating Game in Database for the first time: ' + savedGame));
    }

    highlightSelection(row, col) {
        const selectedValue = this.board[row][col].value;
        
        this.grid.forEach(({ cellRect }) => {
            cellRect.setFillStyle(this.cellBackgroundColor);
        });

        this.grid.forEach(({ cellRect, cell }, index) => {
            const gridRow = Math.floor(index / 9);
            const gridCol = index % 9;

            if (gridRow === row || gridCol === col) {
                cellRect.setFillStyle(this.tertiaryColor);
            }

            if (cell.value !== null && cell.value === selectedValue) {
                cellRect.setFillStyle(this.highlightColor);
            }

            if(Math.floor(row / 3) === Math.floor(gridRow / 3) && Math.floor(col / 3) === Math.floor(gridCol / 3)) {
                cellRect.setFillStyle(this.tertiaryColor);
            }
        });

        this.grid.forEach(({ cellRect }) => {
            cellRect.savedColor = cellRect.fillColor;
        });

        const selectedCell = this.grid[row * 9 + col];
        selectedCell.cellRect.setFillStyle(this.highlightColor)
        this.selectedCell = { row, col };
    }

    update() {
        // Game loop updates if needed
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
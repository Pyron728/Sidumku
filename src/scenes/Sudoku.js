import { generateSudoku } from '../generator/BasicSudokuGenerator.js';
import { ApiService } from '../services/api.service.js';

export class SudokuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SudokuScene' });
        this.board = [];
        this.selectedCell = null;
        this.isNoteMode = false;
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

        // Specialized colors
        this.buttonColor = this.secondaryColor;
        this.hoverColor = this.tertiaryColor;
        this.highlightMatchingNumberColor = this.highlightColor;
        this.highlightSameRowAndLineAndSquareColor = this.tertiaryColor;
        this.highlightNotesColor = 0xFF8C00;
        this.basicBackgroundColor = this.primaryColor;
        this.strokeColor = this.textColor;
        this.newNumberColor =  'blue' 
    }

    preload() {
        // preload für Bilddaten und so shit
        this.load.image('pencil', 'assets/pencilmark.png');

    }

    create() {
        this.cameras.main.setBackgroundColor(this.basicBackgroundColor);

        this.apiService = new ApiService();
        this.puzzle = generateSudoku('medium');
        this.board = this.puzzle.currentBoard;
        this.solution = this.puzzle.solvedBoard;
        this.createGrid();
        this.createUI();
        this.createTimer()
        this.input.keyboard.on('keydown', (event) => {
            if (this.selectedCell != null && /^[1-9]$/.test(event.key)) {
                const { row, col } = this.selectedCell; 
                this.insertNumber(row, col, parseInt(event.key));
            }
        });
        this.createSudokuInDb(this.puzzle);
        this.createBackToMenuButton();
    }

    createGrid() {
        const strokeWidth = 2
        const gridX = (this.scale.width - (9 * this.cellSize + 4 * 4)) / 2;
        const gridY = (this.scale.height - (9 * this.cellSize+ 4 * 4)) / 2 + 30;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.board[row][col];

                const extraX = Math.floor(col / 3) * 4;
                const extraY = Math.floor(row / 3) * 4;

                const x = gridX + col * this.cellSize + extraX;
                const y = gridY + row * this.cellSize + extraY;

                 const cellRect = this.add.rectangle(x, y, this.cellSize, this.cellSize, this.basicBackgroundColor);
                cellRect.setStrokeStyle(strokeWidth, this.strokeColor);
                cellRect.setInteractive();
                
                cellRect.on('pointerover', () => {
                    if(cellRect.fillColor == this.basicBackgroundColor){
                        cellRect.savedColor = cellRect.fillColor;
                        cellRect.setFillStyle(this.hoverColor);
                    }
                });

                cellRect.on('pointerout', () => {
                    if(cellRect.fillColor != this.highlightColor)
                        cellRect.setFillStyle(cellRect.savedColor || this.basicBackgroundColor);
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

                let notesText = []
                if (!cell.value) {
                    notesText = this.createNotesText(cell, cellRect);
                }

                this.grid.push({ cellRect, text, cell, row, col, notesText });
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
    
        const gridHeight = 9 * this.cellSize + 4 * 4;
        const buttonSpacing = 10;
        const numpadHeight = 3 * this.cellSize + 2 * buttonSpacing;
        
        this.numberPadX = this.gridX + 9 * this.cellSize + 40;
        
        this.numberPadY = this.gridY + gridHeight / 2 - 35 - numpadHeight / 2;

        const pencilXPosition = this.numberPadX + this.cellSize + buttonSpacing;
        const pencilYPosition = this.numberPadY - this.cellSize / 2;
        const pencilSize = this.cellSize / 1.5;
        const pencilmark = this.add.sprite(pencilXPosition, pencilYPosition, 'pencil').
            setDisplaySize(pencilSize, pencilSize).
            setInteractive().
            setTintFill(this.textColor);

        const updatePencilAppearance = (isHovering) => {
            if (this.isNoteMode) {
                pencilmark.setTintFill(isHovering ? this.textColor : this.hoverColor);
            } else {
                pencilmark.setTintFill(isHovering ? this.hoverColor : this.textColor);
            }
        };
        pencilmark.on('pointerdown', () => {
            this.isNoteMode = !this.isNoteMode; 
            updatePencilAppearance(false); 
        });
        pencilmark.on('pointerover', () => {
            updatePencilAppearance(true); 
        });
        pencilmark.on('pointerout', () => {
            updatePencilAppearance(false); 
        });

        numbers.forEach((row, rowIndex) => {
            row.forEach((button, colIndex) => {
                const x = this.numberPadX + colIndex * (this.cellSize + 10);
                const y = this.numberPadY + rowIndex * (this.cellSize + 10) + this.cellSize / 2;
    
                const radius = 10;

                const buttonBg = this.add.graphics();
                buttonBg.x = x;
                buttonBg.y = y;

                const drawButton = (fillColor) => {
                    buttonBg.clear();
                    buttonBg.fillStyle(fillColor, 1);
                    buttonBg.lineStyle(2, this.hoverColor);
                    buttonBg.fillRoundedRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, radius);
                    buttonBg.strokeRoundedRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, radius);
                };

                drawButton(this.buttonColor);

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

                buttonBg.on('pointerover', () => drawButton(this.hoverColor));
                buttonBg.on('pointerout', () => drawButton(this.buttonColor));

                buttonBg.on('pointerdown', () => {
                    if (this.selectedCell) {
                        const { row, col } = this.selectedCell;
                        this.insertNumber(row, col, parseInt(button));
                    }
                });
            });
        });
    }

    createTimer(){
        this.timer = this.add.text(
            this.scale.width / 2,
            40,
            '00:00',
            {
                fontSize: '32px',
                fontFamily: 'Bold',
                color: this.textColor
            }
        ).setOrigin(1, 0.5);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });   

        this.updateTimerDisplay()
    }

    updateTimer() {
        this.puzzle.timeSpent++;        
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const totalSeconds = this.puzzle.timeSpent || 0;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedMinutes = `${minutes < 10 ? ' ': ''}${minutes.toString()}`;
        const formattedTime = `${formattedMinutes}:${seconds.toString().padStart(2, '0')}`;

        this.timer.setText(formattedTime);
    }

    updateGrid() {
        this.grid.forEach(({ cellRect, text, cell, row, col, notesText }) => {
            if (notesText) {
                notesText.forEach(n => {
                    n.destroy();
                });
            }
    
            if (cell.value !== null) {
                text.setText(cell.value.toString());
                const textColor = cell.isGiven ? this.textColor : this.newNumberColor;
                text.setColor(textColor);
                this.grid.find(c => c.row === row && c.col === col).notesText = [];
            } else {
                text.setText('');    
                const notesTexts = this.createNotesText(cell, cellRect);
                this.grid.find(c => c.row === row && c.col === col).notesText = notesTexts;
            }
        });
    }

    // Creates the Node Text for only visually purposes in the grid
    createNotesText(cell, cellRect){
        const cellSize = this.cellSize
        const notesTexts = [];
        for (let n = 1; n <= 9; n++) {
            if (cell.notes.includes(n)) {
                const x = cellRect.x;
                const y = cellRect.y;

                const noteX = x - cellSize / 3 + ((n - 1) % 3) * cellSize / 3;
                const noteY = y - cellSize / 3 + Math.floor((n - 1) / 3) * cellSize / 3;

                const noteText = this.add.text(noteX, noteY, n.toString(), {
                    fontSize: '12px',
                    color: this.textColor,
                    align: 'center'
                }).setOrigin(0.5);

                notesTexts.push(noteText);
            }
        }
        return notesTexts;
    }

    insertNumber(row, col, number) {
        if (!this.board[row][col].isGiven) {
            if (!this.isNoteMode) {
                if (this.solution[row][col].value === number) {
                    this.board[row][col].value = number;

                    // Automatically remove notes from the number in same Row, Col, Square if number was correct
                    this.board.forEach((currentRow, currentRowIndex) => {
                        currentRow.forEach((currentCell, currentColIndex) => {
                            const sameSquare = Math.floor(row / 3) === Math.floor(currentRowIndex / 3) && Math.floor(col / 3) === Math.floor(currentColIndex / 3)
                            const noteIndex = currentCell.notes.indexOf(number);
                            if ((row === currentRowIndex || col == currentColIndex || sameSquare) && noteIndex != -1) {
                                currentCell.notes.splice(noteIndex, 1);    
                            }
                        });
                    })
                }
                else {
                    console.log("Wrong Number");
                    // simple Errorhandling (complex errorhandling is part of another Userstory)
                    const cellRect = this.grid.find(c => c.row === row && c.col === col).cellRect;
                    cellRect.setFillStyle(0xff6666);
                    this.time.delayedCall(500, () => {
                        cellRect.setFillStyle(this.highlightColor);
                    });
                    return
                }
            }

            // Remove or add Notes in a cell
            else {
                const currentNotes = this.board[row][col].notes;
                const index = currentNotes.indexOf(number);
                index === -1 ? currentNotes.push(number): currentNotes.splice(index, 1);
                this.board[row][col].notes = currentNotes;
            }
            this.updateGrid();
            this.highlightSelection(row, col);
            this.saveSudoku();
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
        
        //Resets all cell backgrounds and note highlights
        this.grid.forEach(({ cellRect, notesText }) => {
            cellRect.setFillStyle(this.basicBackgroundColor);
            if (notesText) {
                notesText.forEach(noteText => {
                    if (noteText.borderGraphics) {
                        noteText.borderGraphics.destroy();
                        noteText.borderGraphics = null;
                    }
                });
            }
        });

        this.grid.forEach(({ cellRect, cell, notesText }, index) => {
            const gridRow = Math.floor(index / 9);
            const gridCol = index % 9;

            //Highlight same row and grid
            if (gridRow === row || gridCol === col) {
                cellRect.setFillStyle(this.highlightSameRowAndLineAndSquareColor);
            }

            //Highlight same numbers in the entire sudoku
            if (cell.value !== null && cell.value === selectedValue) {
                cellRect.setFillStyle(this.highlightMatchingNumberColor);
            }

            // Highlight same Sudoku-square
            if(Math.floor(row / 3) === Math.floor(gridRow / 3) && Math.floor(col / 3) === Math.floor(gridCol / 3)) {
                cellRect.setFillStyle(this.highlightSameRowAndLineAndSquareColor);
            }

            // Highlight notes that match the selected value
            if (selectedValue !== null && notesText) {
                notesText.forEach(noteText => {
                    if (parseInt(noteText.text) === selectedValue) {
                        const padding = 2;
                        const borderGraphics = this.add.graphics();
                        borderGraphics.lineStyle(1.5, this.highlightNotesColor, 1); // Orange border
                        borderGraphics.strokeRect(
                            noteText.x - noteText.width/2 - padding, 
                            noteText.y - noteText.height/2 - padding,
                            noteText.width + padding*2, 
                            noteText.height + padding*2
                        );
                        noteText.borderGraphics = borderGraphics;
                    }
                });
            }
        });

        this.grid.forEach(({ cellRect }) => {
            cellRect.savedColor = cellRect.fillColor;
        });

        const selectedCell = this.grid[row * 9 + col];
        selectedCell.cellRect.setFillStyle(this.highlightColor)
        this.selectedCell = { row, col };
    }
    createBackToMenuButton() {
        const buttonWidth = 180;
        const buttonHeight = 40;
        const radius = 10;

        const x = 100;
        const y = 40;

        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(this.secondaryColor, 1);
        buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
        buttonBg.lineStyle(2, this.hoverColor);
        buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
        buttonBg.setPosition(x, y);

        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        const buttonText = this.add.text(x, y, 'Main Menu', {
            fontFamily: 'Bold',
            fontSize: '18px',
            color: '#' + this.textColor.toString(16),
        }).setOrigin(0.5);

        buttonBg.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(this.hoverColor, 1);
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
            buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(this.secondaryColor, 1);
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
            buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
        });

        buttonBg.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }


    update() {
        this.updateTimerDisplay()
    }
}

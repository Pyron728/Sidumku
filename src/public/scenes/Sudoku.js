import { generateSudoku } from '../generator/BasicSudokuGenerator.js';
import { ApiService } from '../services/api.service.js';
import {AuthService} from "../services/auth.service.js";

export class SudokuScene extends Phaser.Scene {
    data;
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
        this.newNumberColor =  'blue';
        this.errorColor = 'red';
    }

    init(data) {
        if (data.loadedGame) {
            this.puzzle = data.loadedGame;
            this.board = this.puzzle.currentBoard;
            this.solution = this.puzzle.solvedBoard;
            this.difficulty = this.puzzle.difficulty;
            this.availableHints = 3 - (this.puzzle.hintsUsed || 0);
        } else {
            this.difficulty = data.difficulty;
            this.puzzle = generateSudoku(this.difficulty);
            this.board = this.puzzle.currentBoard;
            this.solution = this.puzzle.solvedBoard;
            this.availableHints = 3;
        }
    }


    preload() {
        // preload für Bilddaten und so shit
        this.load.image('pencil', 'assets/pencilmark.png');
        this.load.image('logo_cow', 'assets/cow.png');
        this.load.image('eraser', 'assets/eraser.png');
        this.load.image('martin', 'assets/martinscorsese.png');
        this.load.image('lightbulb', 'assets/lightbulb.png');
        this.load.image('star', 'assets/star.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(this.basicBackgroundColor);

        this.apiService = new ApiService();
        this.authService = new AuthService();

        this.puzzle.timeSpent = this.puzzle.timeSpent ?? 0;
        this.puzzle.mistakes = this.puzzle.mistakes ?? 0;
        this.puzzle.hintsUsed = this.puzzle.hintsUsed ?? 0;
        this.availableHints = 3 - this.puzzle.hintsUsed;

        if (!this.puzzle._id || this.puzzle._id.startsWith('sudoku_')) {
            this.createSudokuInDb(this.puzzle);
        }

        this.createGrid();
        this.createUI();
        this.createPauseButton();
        this.createTimer();
        this.createErrorCounter();
        this.createHintCounter();
        this.createDifficultyText();
        this.updateMistakeCounter();
        this.updateHintCounter();
        this.input.keyboard.on('keydown', (event) => {
            if (this.selectedCell) {
                const { row, col } = this.selectedCell; 
                if (/^[1-9]$/.test(event.key)) {
                    this.insertNumber(row, col, parseInt(event.key));
                }
                else if(event.key == ('Backspace' || 'Delete')){
                    this.eraseCell();
                }
                // Arrow keys and WASD for navigation
                else if (event.key === 'ArrowUp' || event.key === 'w') {
                    this.moveSelection(row - 1, col);
                }
                else if (event.key === 'ArrowDown' || event.key === 's') {
                    this.moveSelection(row + 1, col);
                }
                else if (event.key === 'ArrowLeft' || event.key === 'a') {
                    this.moveSelection(row, col - 1);
                }
                else if (event.key === 'ArrowRight' || event.key === 'd') {
                    this.moveSelection(row, col + 1);
                }
            }
            else {
                if (/^[1-9]$/.test(event.key)) {
                    this.highlightOnlyNumbersAndNotes(parseInt(event.key));
                }
            }
        });
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
                    fontFamily: 'Nunito',
                    fontWeight: cell.isGiven ? '700' : '400',
                    color: cell.isGiven ? textColor : this.newNumberColor
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

        const iconYPosition = this.numberPadY - this.cellSize / 2;

        const pencilXPosition = this.numberPadX + this.cellSize + buttonSpacing;
        const pencilSize = this.cellSize / 1.5;
        const pencilmark = this.add.sprite(pencilXPosition, iconYPosition, 'pencil').
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

        const hintXPosition = this.numberPadX + (this.cellSize + buttonSpacing) * 2;
        const hintSize = this.cellSize / 1.5;
        const hintButton = this.add.sprite(hintXPosition, iconYPosition, 'lightbulb')
            .setDisplaySize(hintSize, hintSize)
            .setInteractive()
            .setTintFill(this.textColor)
        hintButton.setScale(0.1);
        
        hintButton.on('pointerdown', () => {
            if (this.availableHints > 0) {
                this.giveHint()
            } else {
                this.tweens.killTweensOf(hintButton);
                hintButton.x = hintXPosition;
                this.tweens.add({
                    targets: hintButton,
                    x: hintButton.x - 5,
                    yoyo: true,
                    repeat: 2,
                    duration: 50
                });
            }
        });
        
        hintButton.on('pointerover', () => {
            hintButton.setTintFill(this.hoverColor);
        });
        
        hintButton.on('pointerout', () => {
            hintButton.setTintFill(this.textColor);

        });

        const eraserXPosition = this.numberPadX;
        const eraserSize = this.cellSize / 1.5;
        const eraser = this.add.sprite(eraserXPosition, iconYPosition, 'eraser').
            setDisplaySize(eraserSize, eraserSize).
            setInteractive().
            setTintFill(this.textColor);

        eraser.on('pointerdown', () => {
            this.eraseCell();
        });

        eraser.on('pointerover', () => {
            eraser.setTintFill(this.hoverColor);
        });
        eraser.on('pointerout', () => {
            eraser.setTintFill(this.textColor);
        });

        this.numberButtons = {}; // key: number string, value: { bg, text }

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

                const buttonText = this.add.text(x, y, button, {
                    fontFamily: 'Nunito',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: this.textColor
                }).setOrigin(0.5);

                buttonBg.on('pointerover', () => drawButton(this.hoverColor));
                buttonBg.on('pointerout', () => drawButton(this.buttonColor));

                buttonBg.on('pointerdown', () => {
                    if (this.selectedCell) {
                        const { row, col } = this.selectedCell;
                        if (this.board[row][col].value == null) {
                            this.insertNumber(row, col, parseInt(button));     
                        }
                        else {
                            this.highlightOnlyNumbersAndNotes(parseInt(button))
                        }
                    }
                    else {
                        this.highlightOnlyNumbersAndNotes(parseInt(button))
                    }
                });

            this.numberButtons[button] = { bg: buttonBg, text: buttonText };

            });
        });
        // Check if the board contains already 9 of the any number and block the button then
        for (let number = 1; number < 9; number++) {
            const count = this.board.flat().filter(cell => cell.value === number).length;   
            if (count === 9) {
                this.disableNumberButtons(number)
            }       
        }
    }

    createErrorCounter() {
        this.errorText = this.add.text(
            this.scale.width / 2 + 100,  // Position it right from the timer
            40,
            'Mistakes: ' + this.puzzle.mistakes.toString(),
            {
                fontSize: '24px',
                fontFamily: 'Nunito',
                fontWeight: '700',
                color: this.textColor
            }
        ).setOrigin(0, 0.5);
    }

    createHintCounter() {
        this.hintText = this.add.text(
            this.scale.width / 2 - 300,  // Position it right from the mistakes counter
            40,
            'Hints left: ' + this.availableHints.toString(),
            {
                fontSize: '24px',
                fontFamily: 'Nunito',
                fontWeight: '700',
                color: this.textColor
            }
        ).setOrigin(0, 0.5);
    }
    

    createDifficultyText(){
        this.diffucultyText = this.add.text(
            this.scale.width / 2,  
            this.scale.height - 50,
            this.difficulty,
            {
                fontSize: '24px',
                fontFamily: 'Nunito',
                fontWeight: '700',
                color: this.textColor
            }
        ).setOrigin(1, 0.5);
    }

    updateMistakeCounter() {
        this.errorText.setText(`Mistakes: ${this.puzzle.mistakes}`);

        // Little Counter animation
        this.tweens.add({
            targets: this.errorText,
            scale: 1.1,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    updateHintCounter() {
        this.hintText.setText(`Hints left: ${this.availableHints}`);
    
        // Animation für den Hinweis-Zähler
        this.tweens.add({
            targets: this.hintText,
            scale: 1.1,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
    
    playHintAnimation(row, col) {
        const cellIdx = row * 9 + col;
        const cellText = this.grid[cellIdx].text;
        const cellRect = this.grid[cellIdx].cellRect;
        const cell = this.grid.find(c => c.row === row && c.col === col);

        
        // Funkelnde Sterne um die Zahl herum
        for (let i = 0; i < 3; i++) {
            const star = this.add.sprite(
                cellRect.x + (Math.random() - 0.5) * this.cellSize, 
                cellRect.y + (Math.random() - 0.5) * this.cellSize, 
                'star'
            ).setDisplaySize(0.5, 0.5).setDepth(5);
            
            // Stern-Animation
            this.tweens.add({
                targets: star,
                scale: { from: 0.1, to: 0.4 },
                alpha: { from: 1, to: 0 },
                duration: 1500,
                ease: 'Sine.easeOut',
                onComplete: () => star.destroy()
            });
        }
        cellText.setColor(this.newNumberColor);
    }

    giveHint() {
        // Korrekte Zahl aus der Lösung holen
        let hintCellValue = 1;
        let row = 0;
        let col = 0;

        while (hintCellValue) {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
            hintCellValue = this.board[row][col].value;
        }

        const correctValue = this.solution[row][col].value;
        this.board[row][col].value = correctValue;
        this.removeAutomaticallyNotesFromBoard(row, col, correctValue);
        this.availableHints--;
        this.puzzle.hintsUsed++;
        this.updateHintCounter();
        
        this.playHintAnimation(row, col);
        
        this.updateGrid();
        this.highlightSelection(row, col);
        
        if (this.authService.isLoggedIn()) {
            this.saveSudoku();
        }

        if (this.checkIfCompleted()) {
            this.puzzle.solved = true;
            this.showCompletionPopup();
        }
    }

    createTimer(){
        this.timer = this.add.text(
            this.scale.width / 2,
            40,
            '00:00',
            {
                fontSize: '32px',
                fontFamily: 'Nunito',
                fontWeight: '700',
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
            } else if(cell.mistakeValue !== null){
                text.setText(cell.mistakeValue.toString());
                text.setColor(this.errorColor);
            }
            else {
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
                    fontFamily: 'Nunito',
                    fontWeight: '400',
                    color: this.textColor,
                    align: 'center'
                }).setOrigin(0.5);

                notesTexts.push(noteText);
            }
        }
        return notesTexts;
    }

    insertNumber(row, col, number) {
        if (!this.board[row][col].isGiven && !this.board[row][col].mistakeValue) {
            if (!this.isNoteMode) {
                if (this.solution[row][col].value === number) {
                    this.board[row][col].value = number;

                    this.removeAutomaticallyNotesFromBoard(row, col, number);

                    // Check if the board contains 9 of the numbers
                    const count = this.board.flat().filter(cell => cell.value === number).length;   
                    if (count === 9) {
                        this.disableNumberButtons(number)
                    }
                }
                else {
                    this.puzzle.mistakes++;
                    this.updateMistakeCounter();
                    this.board[row][col].mistakeValue = number;
                    
                    // Shakes the number for a short time
                    const cellText = this.grid.find(c => c.row === row && c.col === col).text;
                    this.tweens.add({
                        targets: cellText,
                        x: cellText.x - 5,
                        yoyo: true,
                        repeat: 2,
                        duration: 50
                    });
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
        }

        if (this.checkIfCompleted()) {
            this.puzzle.solved = true;
            this.showCompletionPopup();
            if (this.authService.isLoggedIn()) {
                this.saveSudoku(); // save solved status
            }
        }

    }

    removeAutomaticallyNotesFromBoard(row, col, number){
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

    eraseCell() {
        if (!this.selectedCell) {
            return
        }
        const { row, col } = this.selectedCell;
        this.board[row][col].notes = [];
        this.board[row][col].mistakeValue = null;
        this.updateGrid();
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

    moveSelection(row, col) {
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            this.selectedCell = { row, col };
            this.highlightSelection(row, col);
        }
    }

    highlightSelection(row, col) {
        const selectedValue = this.board[row][col].value;

        this.highlightOnlyNumbersAndNotes(selectedValue);

        this.grid.forEach(({ cellRect, cell, notesText }, index) => {
            const gridRow = Math.floor(index / 9);
            const gridCol = index % 9;

            //Highlight same row and grid
            if (gridRow === row || gridCol === col) {
                cellRect.setFillStyle(this.highlightSameRowAndLineAndSquareColor);
            }

            // Highlight same Sudoku-square
            if(Math.floor(row / 3) === Math.floor(gridRow / 3) && Math.floor(col / 3) === Math.floor(gridCol / 3)) {
                cellRect.setFillStyle(this.highlightSameRowAndLineAndSquareColor);
            }
        });

        this.grid.forEach(({ cellRect }) => {
            cellRect.savedColor = cellRect.fillColor;
        });

        const selectedCell = this.grid[row * 9 + col];
        selectedCell.cellRect.setFillStyle(this.highlightColor)
        this.selectedCell = { row, col };
    }

    highlightOnlyNumbersAndNotes(selectedValue){

        this.grid.forEach(({ cellRect, cell, notesText }) => {

            //Resets all cell backgrounds and note highlights
            cellRect.setFillStyle(this.basicBackgroundColor);
            if (notesText) {
                notesText.forEach(noteText => {
                    if (noteText.borderGraphics) {
                        noteText.borderGraphics.destroy();
                        noteText.borderGraphics = null;
                    }
                });
            }

            //Highlight same numbers in the entire sudoku
            if (cell.value !== null && cell.value === selectedValue) {
                cellRect.setFillStyle(this.highlightMatchingNumberColor);
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
    }

    createPauseButton() {
        const buttonWidth = 180;
        const buttonHeight = 40;
        const radius = 10;

        const x = this.scale.width - 100;
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

        const buttonText = this.add.text(x, y, 'Pause', {
            fontFamily: 'Nunito',
            fontWeight: '700',
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
            this.pauseGame();
        });
    }

    disableNumberButtons(number) {
            const btn = this.numberButtons[number];
            btn.bg.disableInteractive();
            btn.text.setColor('#888');
            btn.bg.clear();
            btn.bg.fillStyle(0xcccccc, 1);
    
            btn.bg.lineStyle(2, this.hoverColor);
            btn.bg.fillRoundedRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, 10);
            btn.bg.strokeRoundedRect(-this.cellSize / 2, -this.cellSize / 2, this.cellSize, this.cellSize, 10);      
    }

    pauseGame() {
        this.timerEvent.paused = true;

        this.pauseOverlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.4
        ).setDepth(5);

        this.pauseBlocker = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0x000000,
            0
        ).setInteractive().setDepth(5);

        const cowSize = 400;
        this.pauseCows = [];

        this.grid.forEach(({ cellRect }) => {
            const cow = this.add.image(cellRect.x, cellRect.y, 'logo_cow')
                .setDisplaySize(this.cellSize, this.cellSize)
                .setDepth(6)

            this.pauseCows.push(cow);
        });

        this.createPausePopupButtons();
    }

    createPausePopupButtons() {
        const buttonWidth = 240;
        const buttonHeight = 60;
        const radius = 10;

        const verticalCenter = this.gridY - 4 + (this.cellSize * 8 + 4 * 4) / 2;

        const leftX = this.gridX - buttonWidth / 2 - 40;
        const rightX = this.gridX + this.cellSize * 9 + 4 * 4 + buttonWidth / 2 + 40;
        const buttons = [
            { label: 'Continue', x: leftX, y: verticalCenter, callback: () => this.resumeGame() },
            { label: 'Save & Exit', x: rightX, y: verticalCenter, callback: () => this.saveAndExit() }
        ];

        this.pauseButtons = buttons.map(({ label, x, y, callback }) => {
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(this.secondaryColor, 1);
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
            buttonBg.lineStyle(2, this.hoverColor);
            buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, radius);
            buttonBg.setPosition(x, y).setDepth(6);

            const hitArea = new Phaser.Geom.Rectangle(
                -buttonWidth / 2,
                -buttonHeight / 2,
                buttonWidth,
                buttonHeight
            );
            buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

            const buttonText = this.add.text(x, y, label, {
                fontFamily: 'Nunito',
                fontWeight: '700',
                fontSize: '22px',
                color: '#' + this.textColor.toString(16),
            }).setOrigin(0.5).setDepth(6);

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

            buttonBg.on('pointerdown', callback);

            return { buttonBg, buttonText };
        });
    }


    resumeGame() {
        this.timerEvent.paused = false;

        this.pauseOverlay.destroy();
        this.pauseBlocker.destroy();
        this.pauseCows.forEach(cow => cow.destroy());
        this.pauseButtons.forEach(({ buttonBg, buttonText }) => {
            buttonBg.destroy();
            buttonText.destroy();
        });
    }

    async saveAndExit() {
        if (this.authService.isLoggedIn()) {
            await this.saveSudoku();
        } else {
            console.log('User not logged in — skipping save');
        }
        this.shutdown();
        this.scene.start('MainMenuScene');
    }

    shutdown() {
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        
        if (this.grid) {
            this.grid.forEach(({ cellRect, text, notesText }) => {
                if (text) text.destroy();
                if (cellRect) cellRect.destroy();
                if (notesText) notesText.forEach(n => n.destroy());
            });
            this.grid = [];
        }
        
        if (this.errorText) this.errorText.destroy();
        if (this.hintText) this.hintText.destroy();
        if (this.timer) this.timer.destroy();
        if (this.diffucultyText) this.diffucultyText.destroy();
        
        this.selectedCell = null;
        this.isNoteMode = false;
    }

    checkIfCompleted() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const current = this.board[row][col];
                const solved = this.solution[row][col];
                if (current.value !== solved.value) {
                    return false;
                }
            }
        }
        return true;
    }

    showCompletionPopup() {
        this.timerEvent.paused = true;

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const overlay = this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.6)
            .setDepth(10);

        const inputBlocker = this.add.rectangle(
            centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0
        ).setInteractive().setDepth(10);

        const scorseseImage = this.add.image(centerX, centerY - 100, 'martin')
            .setDisplaySize(300, 300)
            .setDepth(11);

        this.tweens.add({
            targets: scorseseImage,
            y: centerY - 120,
            angle: {from: -10, to: 10},
            duration: 300,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: scorseseImage,
            scale: {from: 1, to: 1.05},
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const time = this.timer.text;
        const mistakes = this.puzzle.mistakes;

        const statsBg = this.add.graphics().setDepth(10);
        statsBg.fillStyle(this.secondaryColor, 1);
        statsBg.fillRoundedRect(centerX - 150, centerY + 100 - 40, 300, 95, 12);

        const statsText = this.add.text(centerX, centerY + 105,
            `Solved in ${time}\nMistakes: ${mistakes}\nHints used: ${this.puzzle.hintsUsed}`, {
                fontFamily: 'Nunito',
                fontSize: '26px',
                fontWeight: '700',
                align: 'center',
                color: '#' + this.textColor.toString(16)
            }).setOrigin(0.5).setDepth(11);

        const buttonWidth = 240;
        const buttonHeight = 60;
        const buttonRadius = 10;

        const menuButtonBg = this.add.graphics().setDepth(11);
        menuButtonBg.fillStyle(this.secondaryColor, 1);
        menuButtonBg.fillRoundedRect(
            centerX - buttonWidth / 2,
            centerY + 190 - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            buttonRadius
        );
        menuButtonBg.lineStyle(2, this.hoverColor);
        menuButtonBg.strokeRoundedRect(
            centerX - buttonWidth / 2,
            centerY + 190 - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            buttonRadius
        );

        menuButtonBg.setInteractive(new Phaser.Geom.Rectangle(
            centerX - buttonWidth / 2,
            centerY + 190 - buttonHeight / 2,
            buttonWidth,
            buttonHeight
        ), Phaser.Geom.Rectangle.Contains);

        const menuButtonText = this.add.text(centerX, centerY + 190, 'Return to Menu', {
            fontFamily: 'Nunito',
            fontSize: '22px',
            fontWeight: '700',
            color: '#' + this.textColor.toString(16),
        }).setOrigin(0.5).setDepth(12);

        menuButtonBg.on('pointerover', () => {
            menuButtonBg.clear();
            menuButtonBg.fillStyle(this.hoverColor, 1);
            menuButtonBg.fillRoundedRect(centerX - buttonWidth / 2, centerY + 190 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            menuButtonBg.strokeRoundedRect(centerX - buttonWidth / 2, centerY + 190 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });

        menuButtonBg.on('pointerout', () => {
            menuButtonBg.clear();
            menuButtonBg.fillStyle(this.secondaryColor, 1);
            menuButtonBg.fillRoundedRect(centerX - buttonWidth / 2, centerY + 190 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            menuButtonBg.strokeRoundedRect(centerX - buttonWidth / 2, centerY + 190 - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });

        menuButtonBg.on('pointerdown', () => {
            overlay.destroy();
            inputBlocker.destroy();
            scorseseImage.destroy();
            statsBg.destroy();
            statsText.destroy();
            menuButtonBg.destroy();
            menuButtonText.destroy();
            this.shutdown();
            this.scene.start('MainMenuScene');
        });
    }

    update() {
        this.updateTimerDisplay()
    }
}

import { ApiService } from '../services/api.service.js';

export class PausedGames extends Phaser.Scene {
    constructor() {
        super({ key: 'PausedGames' });
        this.apiService = new ApiService();
    }

    async create() {
        this.cameras.main.setBackgroundColor(0xFFFAED); // Your primaryColor

        const playerId = localStorage.getItem('id');
        const pausedGames = await this.apiService.getSudokusForUser(playerId);

        const boxSize = 240;
        const gap = 40;
        const columns = 3;

        if (!pausedGames.length) {
            this.add.text(this.scale.width / 2, this.scale.height / 2, 'No paused games found.', {
                fontSize: '32px',
                fontFamily: 'Nunito',
                color: '#000'
            }).setOrigin(0.5);
            return;
        }

        pausedGames.forEach((game, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            // Total width of a full row of boxes with gaps
            const totalRowWidth = columns * boxSize + (columns - 1) * gap;
            const startX = (this.scale.width - totalRowWidth) / 2;

            const x = startX + col * (boxSize + gap);
            const y = 100 + row * (boxSize + gap);

            this.createSudokuPreview(game, x, y);
        });
    }


    createSudokuPreview(game, x, y) {
        const boxSize = 240; // Increased size
        const cellSize = 16; // Bigger mini cells
        const gridSize = 9 * cellSize;
        const borderColor = game.solved ? 0x4CAF50 : 0xDACDAA; // Green if solved
        const borderWidth = game.solved ? 3 : 2;

        const box = this.add.rectangle(x, y, boxSize, boxSize, 0xFAEDD6)
            .setOrigin(0)
            .setStrokeStyle(borderWidth, borderColor)
            .setInteractive();

        // Center mini-sudoku
        const miniX = x + (boxSize - gridSize) / 2;
        const miniY = y + 20;

        this.drawMiniSudoku(miniX, miniY, game.currentBoard, this, cellSize);

        // Difficulty label
        this.add.text(x + boxSize / 2, y + boxSize - 50, `Difficulty: ${game.difficulty}`, {
            fontFamily: 'Nunito',
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#32383C'
        }).setOrigin(0.5);

        // Time label
        this.add.text(x + boxSize / 2, y + boxSize - 25, `Time: ${Math.floor(game.timeSpent / 60)}m ${game.timeSpent % 60}s`, {
            fontFamily: 'Nunito',
            fontSize: '16px',
            color: '#32383C'
        }).setOrigin(0.5);

        box.on('pointerdown', () => {
            this.scene.start('SudokuScene', { loadedGame: game });
        });

        box.on('pointerover', () => box.setFillStyle(0xEAD9C6));
        box.on('pointerout', () => box.setFillStyle(0xFAEDD6));

        if (game.solved) {
            this.add.text(x + boxSize - 10, y + 10, '✔', {
                fontSize: '18px',
                color: '#4CAF50',
                fontFamily: 'Nunito'
            }).setOrigin(1, 0);
        }

    }

    drawMiniSudoku(x, y, board, scene, cellSize = 12) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = board[row][col];
                const rectX = x + col * cellSize;
                const rectY = y + row * cellSize;

                scene.add.rectangle(rectX, rectY, cellSize, cellSize, 0xfffaed)
                    .setStrokeStyle(0.5, 0x32383c)
                    .setOrigin(0);

                if (cell.value) {
                    scene.add.text(rectX + cellSize / 2, rectY + cellSize / 2, cell.value.toString(), {
                        fontSize: `${cellSize - 4}px`,
                        fontFamily: 'Nunito',
                        color: '#32383c'
                    }).setOrigin(0.5);
                }
            }
        }
    }
}

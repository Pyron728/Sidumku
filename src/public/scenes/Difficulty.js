// DifficultyScene.js
class DifficultyScene extends Phaser.Scene {
    constructor() {
        super('DifficultyScene');
        
        // Configurable colors
        this.colors = {
            background: 0xFFFAED,      // Light cream background
            buttonFill: 0xFEEAC9,      // Light beige button fill
            buttonBorder: 0xE5C99F,    // Darker beige button border
            textColor: '#15313B',      // Dark navy text
            titleColor: '#15313B',     // Dark navy title
            buttonHover: 0xDACDAA       
        };
        
        // Button dimensions and spacing
        this.buttonConfig = {
            width: 180,
            height: 90,
            spacing: 50,
            borderRadius: 16,
            borderWidth: 2,
            fontSize: 28
        };
    }

    preload() {
        // No assets to preload
    }

    create() {
        // Set background color
        this.cameras.main.setBackgroundColor(this.colors.background);
        
        // Create centered container for content
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Add title text
        const titleText = this.add.text(centerX, centerY - 150, 'Select a difficulty', {
            fontFamily: 'Nunito',
            fontSize: '48px',
            color: this.colors.titleColor,
        }).setOrigin(0.5);
        
        // Create the difficulty buttons
        const difficulties = ['Easy', 'Medium', 'Hard'];
        const buttonWidth = this.buttonConfig.width;
        const totalWidth = difficulties.length * buttonWidth + (difficulties.length - 1) * this.buttonConfig.spacing;
        const startX = centerX - totalWidth / 2 + buttonWidth / 2;
        
        difficulties.forEach((difficulty, index) => {
            const x = startX + index * (buttonWidth + this.buttonConfig.spacing);
            const button = this.createButton(x, centerY + 50, difficulty);
            
            // Add click event to each button - fixing the hitAreaCallback error
            button.setInteractive()
                .on('pointerdown', () => this.selectDifficulty(difficulty))
                .on('pointerover', () => this.tweenButtonHover(button, true))
                .on('pointerout', () => this.tweenButtonHover(button, false));
        });
        
        const backToMenuButton = this.createButton(centerX, centerY + 200, 'Back');
        backToMenuButton.setInteractive()
            .on('pointerdown', () => this.scene.start('MainMenuScene'))
            .on('pointerover', () => this.tweenButtonHover(backToMenuButton, true))
            .on('pointerout', () => this.tweenButtonHover(backToMenuButton, false));
    }
    
    createButton(x, y, text) {
        const width = this.buttonConfig.width;
        const height = this.buttonConfig.height;
        const radius = this.buttonConfig.borderRadius;
        
        // Create button graphics container
        const button = this.add.container(x, y);
        
        // Create button background with rounded corners
        const background = this.add.graphics();
        background.fillStyle(this.colors.buttonFill, 1);
        background.lineStyle(this.buttonConfig.borderWidth, this.colors.buttonBorder, 1);
        
        // Draw rounded rectangle
        background.fillRoundedRect(-width/2, -height/2, width, height, radius);
        background.strokeRoundedRect(-width/2, -height/2, width, height, radius);
        
        // Add button text
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Nunito',
            fontSize: `${this.buttonConfig.fontSize}px`,
            color: this.colors.textColor
        }).setOrigin(0.5);
        
        // Add components to container
        button.add([background, buttonText]);
        
        // Add hit area for proper interaction
        button.setSize(width, height);
        
        return button;
    }
    
    tweenButtonHover(button, isOver) {
        // Get the graphics object (first child)
        const graphics = button.getAt(0);
        
        // Directly change the fill color (no tweening for color)
        graphics.clear();
        graphics.fillStyle(isOver ? this.colors.buttonHover : this.colors.buttonFill, 1);
        graphics.lineStyle(this.buttonConfig.borderWidth, this.colors.buttonBorder, 1);
        
        // Redraw the rounded rectangle with new color
        const width = this.buttonConfig.width;
        const height = this.buttonConfig.height;
        const radius = this.buttonConfig.borderRadius;
        graphics.fillRoundedRect(-width/2, -height/2, width, height, radius);
        graphics.strokeRoundedRect(-width/2, -height/2, width, height, radius);
        
        // Scale effect (keep the tween for this)
        this.tweens.add({
            targets: button,
            scaleX: isOver ? 1.05 : 1,
            scaleY: isOver ? 1.05 : 1,
            duration: 150
        });
    }
    
    selectDifficulty(difficulty) {
        this.scene.start('SudokuScene', { difficulty});
    }
}

export default DifficultyScene;
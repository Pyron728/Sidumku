export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });

        // Color palette
        this.primaryColor = 0xFFFAED;
        this.secondaryColor = 0xFAEDD6;
        this.tertiaryColor = 0xDACDAA;
        this.textColor = 0x32383C;
        this.hoverColor = this.tertiaryColor;
    }


    preload() {
        this.load.image('logo_cow', 'assets/cow.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(this.primaryColor);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.image(centerX - 150, centerY - 150, 'logo_cow').setOrigin(0.5).setScale(0.3);
        // Game Title
        this.add.text(centerX + 50, centerY - 150, 'Sidumku', {
            fontFamily: 'Nunito',
            fontWeight: '900',
            fontSize: '64px',
            color: '#' + this.textColor.toString(16),
        }).setOrigin(0.5);

        // Buttons
        const buttons = [
            { label: 'New Game', scene: 'SudokuScene' },
            { label: 'Login', callback: () => window.location.href = '/login' },
            { label: 'Settings', callback: () => console.log('Settings pressed...') },
        ];

        const buttonHeight = 60;
        const buttonSpacing = 20;

        buttons.forEach((btn, index) => {
            const y = centerY + index * (buttonHeight + buttonSpacing);
            this.createButton(centerX, y, btn.label, btn.scene, btn.callback);
        });
    }

    createButton(x, y, label, targetScene = null, callback = null) {
        const buttonWidth = 250;
        const buttonHeight = 60;
        const radius = 12;

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

        const buttonText = this.add.text(x, y, label, {
            fontFamily: 'Nunito',
            fontWeight: '700',
            fontSize: '28px',
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
            if (targetScene) {
                this.scene.start(targetScene);
            } else if (callback) {
                callback();
            }
        });
    }
}

import { AuthService } from '../services/auth.service.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });

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

        const centerX = Math.round(this.scale.width / 2);
        const centerY = Math.round(this.scale.height / 2);

        const logoImage = this.add.image(centerX - 150, centerY - 150, 'logo_cow')
            .setOrigin(0.5)
            .setScale(0.3)
            .setInteractive({ cursor: 'pointer' });

        this.add.text(centerX + 50, centerY - 150, 'Sidumku', {
            fontFamily: 'Nunito',
            fontSize: '64px',
            fontStyle: '900',
            color: '#' + this.textColor.toString(16),
        }).setOrigin(0.5);

        logoImage.on('pointerdown', () => {
            this.spawnPoo(
                logoImage.x + Phaser.Math.Between(-30, 30),
                logoImage.y + Phaser.Math.Between(-30, 30)
            );
        });

        const authService = new AuthService();
        const buttons = [
            { label: 'Neues Spiel', scene: 'DifficultyScene' }, 
        ];

        if (authService.isLoggedIn()) {
            buttons.push({ label: 'Pausiert' });
        } 

        const buttonHeight = 60;
        const buttonSpacing = 30;

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
        buttonBg.setPosition(Math.round(x), Math.round(y));

        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        const buttonText = this.add.text(Math.round(x), Math.round(y), label, {
            fontFamily: 'Nunito',
            fontSize: '28px',
            fontStyle: '700',
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

    spawnPoo(x, y) {
        const poo = this.add.text(x, y, '💩', {
            fontSize: `${Phaser.Math.Between(24, 36)}px`
        }).setOrigin(0.5).setAlpha(1);

        this.tweens.add({
            targets: poo,
            y: y - Phaser.Math.Between(30, 60),
            alpha: 0,
            duration: Phaser.Math.Between(800, 1200),
            ease: 'Sine.easeIn',
            onComplete: () => {
                poo.destroy();
            }
        });
    }
}
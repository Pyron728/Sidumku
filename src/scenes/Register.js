export class RegisterScene extends Phaser.Scene {
    constructor() {
        super('RegisterScene');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
        this.load.image('logo', 'assets/phaser.png');
        this.load.image('button', 'assets/button.png');
    }

    create() {
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        const logo = this.add.image(640, 200, 'logo');

        const button = this.add.image(640, 400, 'button').setInteractive();

        button.on('pointerdown', () => {
            this.registerUser();
        });

        const style = { font: "20px Arial", fill: "#ffffff" };
        this.usernameText = this.add.text(100, 300, "Username:", style);
        this.passwordText = this.add.text(100, 350, "Password:", style);

        this.usernameInput = this.add.dom(400, 300).createElement('input');
        this.usernameInput.setAttribute('type', 'text');
        this.usernameInput.setAttribute('placeholder', 'Enter username');
        this.usernameInput.setStyle({ width: '200px' });

        this.passwordInput = this.add.dom(400, 350).createElement('input');
        this.passwordInput.setAttribute('type', 'password');
        this.passwordInput.setAttribute('placeholder', 'Enter password');
        this.passwordInput.setStyle({ width: '200px' });
    }
} 
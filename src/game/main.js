import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { DefaultPluginsConfig } from 'phaser-plugin-inspector';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    render: {
        pixelArt: false,  // Убедитесь, что это выключено, если вы не хотите четких пикселей
        antialias: true,
        powerPreference: 'high-performance',
        premultipliedAlpha: true,   // Включает сглаживание
    },
    scene: [
        MainGame
    ],
    dom: {
        createContainer: true
    }
};

const StartGame = (parent) => {
    return new Game({
         ...config,
         parent,
        //  plugins: DefaultPluginsConfig
         });
}

export default StartGame;


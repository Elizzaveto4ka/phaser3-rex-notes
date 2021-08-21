import 'phaser';
import NoiseDelayFadePipelinePlugin from '../../plugins/noisedelayfadepipeline-plugin';

class Demo extends Phaser.Scene {
    constructor() {
        super({
            key: 'examples'
        })
    }

    preload() {
        this.load.image('classroom', 'assets/images/backgrounds/classroom.png');
        this.load.image('road', 'assets/images/backgrounds/road.png');
    }

    create() {
        var image0 = this.add.image(400, 300, 'road');
        var image1 = this.add.image(400, 300, 'classroom');

        var postFxPlugin = this.plugins.get('rexNoiseDelayFadePipelinePlugin');
        var postFxPipeline = postFxPlugin.add(image1, {
            activeRate: 0.5
        });

        this.input.on('pointerdown', function (pointer) {
            postFxPipeline
                .setNoise()
                .setProgress(0)

            this.tweens.add({
                targets: postFxPipeline,
                progress: 1,
                ease: 'Linear',
                duration: 3000,
                repeat: 0,
                yoyo: false
            });

        }, this)
    }

    update() {
    }
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: Demo,
    plugins: {
        global: [{
            key: 'rexNoiseDelayFadePipelinePlugin',
            plugin: NoiseDelayFadePipelinePlugin,
            start: true
        }]
    }
};

var game = new Phaser.Game(config);
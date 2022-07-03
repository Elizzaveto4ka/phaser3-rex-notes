import GOManager from '../../gameobject/gomanager/GOManager.js';
import TextBob from './TextBob.js';
import Methods from './methods/Methods.js';

class TextManager extends GOManager {
    constructor(scene, config) {
        if (config === undefined) {
            config = {};
        }

        config.BobClass = TextBob;

        super(scene, config);
    }

    setCreateGameObjectCallback(callback) {
        if (!callback) {
            callback = CreateTextObject;
        }
        super.setCreateGameObjectCallback(callback);
        return this;
    }

}

var CreateTextObject = function (scene) {
    return scene.add.text(0, 0, '');
}

Object.assign(
    TextManager.prototype,
    Methods
);

export default TextManager;
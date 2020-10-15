import Factory from './gameobjects/effectlayer/effectlayer/Factory.js';
import Creator from './gameobjects/effectlayer/effectlayer/Creator.js';
import EffectLayer from './gameobjects/effectlayer/effectlayer/EffectLayer.js';

Phaser.GameObjects.GameObjectFactory.register('rexEffectLayer', Factory);
Phaser.GameObjects.GameObjectCreator.register('rexEffectLayer', Creator);

export default EffectLayer;
const { ccclass, property } = cc._decorator;

@ccclass
export default class CardGame_ItemBicker extends cc.Component {

    @property(cc.SpriteFrame)
    listSprite: cc.SpriteFrame[] = [];
    @property({ type: cc.AudioClip })
    sounds: cc.AudioClip[] = [];

    itemId: number = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    initItem(data) {
        this.itemId = data;
        this.node.children[0].getComponent(cc.Sprite).spriteFrame = this.listSprite[this.itemId - 1];
    }

    playFx() {
        this.node.children[0].getComponent(cc.Animation).play("fxBicker_0" + this.itemId);
        cc.audioEngine.playEffect(this.sounds[this.itemId - 1], false);
    }
}

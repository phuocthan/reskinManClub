import VersionConfig from "./VersionConfig";

const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
export default class CPSprite extends cc.Component {

    @property(cc.SpriteFrame)
    other: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sin99: cc.SpriteFrame = null;

    onLoad() {
        this.getComponent(cc.Sprite).spriteFrame = this.other;
    }
}
